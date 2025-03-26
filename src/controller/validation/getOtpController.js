const express = require("express");
const router = express.Router();
const prisma = require("../../model/model");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../../db/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(email, name, otp) {
  try {
    let transporter = nodemailer.createTransport({
      host: config.EmailOTP.ProductionEmail.service,
      port: config.EmailOTP.ProductionEmail.port,
      secure: config.EmailOTP.ProductionEmail.secure,
      auth: {
        user: config.EmailOTP.ProductionEmail.user,
        pass: config.EmailOTP.ProductionEmail.pass,
      },
    });

    const mailOptions = {
      from: config.EmailOTP.ProductionEmail.user,
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

router.post("/validation/getotp", async (req, res) => {
  const { users } = req.body;

  if (!users) {
    return res.status(400).json({ code: 400, message: "Data tidak valid" });
  }

  let method;
  if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(users)) {
    method = "email";
  } else if (/^[0-9]+$/.test(users) && users.length > 9) {
    method = "phoneNumber";
  } else {
    method = "username";
  }

  try {
    const user = await prisma.user.findFirst({
      where: { [method]: users },
    });

    if (!user) {
      return res.status(404).json({ code: 404, message: "User tidak ditemukan" });
    }

    await prisma.oTP.deleteMany({ where: { userId: user.id } });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await sendEmail(user.email, user.name, otpCode);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
        otpStatus: true,
      },
    });

    res.status(200).json({ code: 200, message: "OTP berhasil dikirim" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: error.message || "Terjadi kesalahan server" });
  }
});

module.exports = router;
