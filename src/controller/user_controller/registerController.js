const express = require("express");
const prisma = require("../../model/model");
const router = express.Router();
const nodemailer = require("nodemailer");
const { Role } = require("@prisma/client");

// Fungsi untuk membuat ID unik berdasarkan role dan tanggal pendaftaran
function generateRandomId(role, registrationDate) {
  let result = "";
  const characters = "1234567890";
  const charactersLength = characters.length;

  const date = new Date(registrationDate);
  const formattedDate =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");

  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
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

// Fungsi untuk mengirim email OTP
async function sendEmail(email, name, otp) {
  try {
    let transporter = nodemailer.createTransport({
      host: "mx5.mailspace.id",
      port: 465,
      secure: true,
      auth: {
        user: "noreply@lockify.space",
        pass: "@Sandiku197",
      },
    });

    const mailOptions = {
      from: "noreply@lockify.space",
      to: email,
      subject: "Kode OTP Chemicfest#8",
      text: `Halo ${name},\n\nKode OTP kamu adalah: ${otp}\nKode ini berlaku selama 5 menit.\n\nJangan bagikan kode ini kepada siapa pun.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    throw new Error("Gagal mengirim OTP, coba lagi nanti");
  }
}

// Fungsi untuk membuat OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint registrasi
router.post("/register", async (req, res) => {
  const { name, username, email, password, checkpassword, phoneNumber, role } =
    req.body;

  // Validasi role
  if (!Object.values(Role).includes(role)) {
    return res.status(422).json({ code: 422, message: "Invalid role" });
  }

  // Validasi input
  if (!name || !username || !email || !phoneNumber || !password || !checkpassword || !role) {
    return res.status(422).json({ code: 422, message: "Please fill all fields" });
  }

  // Cek apakah email, username, atau phoneNumber sudah digunakan
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email },
        { phoneNumber: phoneNumber },
      ],
    },
  });

  if (existingUser) {
    return res.status(420).json({ code: 420, message: "User already exists" });
  }

  // Validasi password
  if (password.length < 8) {
    return res.status(426).json({ code: 426, message: "Password must be at least 8 characters" });
  }
  if (!password.match(/[a-z]/)) {
    return res.status(427).json({ code: 427, message: "Password must contain at least one lowercase letter" });
  }
  if (!password.match(/[A-Z]/)) {
    return res.status(428).json({ code: 428, message: "Password must contain at least one uppercase letter" });
  }
  if (!password.match(/[0-9]/)) {
    return res.status(429).json({ code: 429, message: "Password must contain at least one number" });
  }
  if (password !== checkpassword) {
    return res.status(430).json({ code: 430, message: "Passwords do not match" });
  }

  if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
    return res.status(431).json({ code: 431, message: "Invalid email address" });
  }

  const now = new Date();
  const userId = generateRandomId(role, now);

  const expiresOtp = new Date(now);
  expiresOtp.setMinutes(now.getMinutes() + 5); // Perbaikan set waktu OTP

  const otpCode = generateOTP();

  try {
    // Simpan user dan OTP ke database
    const insertUser = await prisma.user.create({
      data: {
        id: userId,
        name: name,
        username: username,
        email: email,
        password: password, // Harus di-hash dalam implementasi nyata!
        phoneNumber: phoneNumber,
        role: role,
        createdAt: now,
        verified: false,
        otp: {
          create: {
            code: otpCode,
            expiresAt: expiresOtp,
            createdAt: now,
            otpStatus: true
          },
        },
      },
      include: {
        otp: true, // Supaya OTP bisa langsung diakses setelah insert
      },
    });

    // Kirim email OTP
    await sendEmail(insertUser.email, insertUser.name, otpCode);
    console.log(`${otpCode}, ${insertUser.email}, ${insertUser.name}`);
    res.status(200).json({ code: 200, message: "Register successful and OTP sent", data: insertUser });
  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).json({ code: 500, message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
