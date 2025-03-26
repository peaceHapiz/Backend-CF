const express = require("express");
const prisma = require("../../model/model");
const router = express.Router();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { Role } = require("@prisma/client");

const configPath = path.join(__dirname, "../../../db/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

function generateRandomId(role, registrationDate) {
  let result = "";
  const characters = "1234567890";
  const date = new Date(registrationDate);
  const formattedDate =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");

  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  if (result.startsWith("0")) {
    result = result.replace("0", "1");
  }

  switch (role.toLowerCase()) {
    case "pelajar":
      return `P-${formattedDate}-${result}`;
    case "guru":
      return `G-${formattedDate}-${result}`;
    case "mahasiswa":
      return `M-${formattedDate}-${result}`;
    default:
      throw new Error("Role tidak valid");
  }
}

async function sendEmail(email, name, otp) {
  try {
    // let transporter = nodemailer.createTransport({
    //   host: config.EmailOTP.ProductionEmail.service,
    //   port: config.EmailOTP.ProductionEmail.port,
    //   secure: config.EmailOTP.ProductionEmail.secure,
    //   auth: {
    //     user: config.EmailOTP.ProductionEmail.user,
    //     pass: config.EmailOTP.ProductionEmail.pass,
    //   },
    // });
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "penjualkelpshake@gmail.com",
        pass: "hizm cxcw fsiq smxr",
      },
  });

    const mailOptions = {
      from: config.EmailOTP.ProductionEmail.user,
      to: email,
      subject: "Kode OTP Chemicfest#8",
      text: `Halo ${name},\n\nKode OTP kamu adalah: ${otp}\nKode ini berlaku selama 5 menit.\n\nJangan bagikan kode ini kepada siapa pun.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email OTP berhasil dikirim ke ${email}`);
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    throw new Error("Gagal mengirim OTP, coba lagi nanti");
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/register", async (req, res) => {
  const { name, username, email, password, checkpassword, phoneNumber, role } = req.body;

  if (!Object.values(Role).includes(role)) {
    return res.status(422).json({ code: 422, message: "Invalid role" });
  }

  if (!name || !username || !email || !phoneNumber || !password || !checkpassword || !role) {
    return res.status(422).json({ code: 422, message: "Please fill all fields" });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }, { phoneNumber }],
    },
  });

  if (existingUser) {
    return res.status(420).json({ code: 420, message: "User already exists" });
  }

  if (password !== checkpassword) {
    return res.status(430).json({ code: 430, message: "Passwords do not match" });
  }

  if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
    return res.status(431).json({ code: 431, message: "Invalid email address" });
  }

  const now = new Date();
  const userId = generateRandomId(role, now);
  const otpCode = generateOTP();
  const expiresOtp = new Date(now.getTime() + 5 * 60 * 1000);

  try {
    const insertUser = await prisma.user.create({
      data: {
        id: userId,
        name,
        username,
        email,
        password,
        phoneNumber,
        role,
        createdAt: now,
        verified: false,
        otp: {
          create: {
            code: otpCode,
            expiresAt: expiresOtp,
            createdAt: now,
            otpStatus: true,
          },
        },
      },
      include: { otp: true },
    });

    await sendEmail(insertUser.email, insertUser.name, otpCode);
    res.status(200).json({ code: 200, message: "Register successful and OTP sent", data: insertUser });
  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).json({ code: 500, message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
