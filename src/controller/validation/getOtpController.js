const express = require("express");
const router = express.Router();
const prisma = require("../../model/model"); // Sesuaikan dengan path model Prisma
const nodemailer = require("nodemailer");

// Fungsi untuk membuat OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fungsi untuk mengirim OTP via email
async function sendEmail(email, name, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password",
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Kode OTP Chemicfest",
    text: `Halo ${name},\n\nKode OTP kamu adalah: ${otp}\nKode ini berlaku selama 5 menit.\n\nJangan bagikan kode ini kepada siapa pun.`,
  };

  return transporter.sendMail(mailOptions);
}

// Endpoint untuk request OTP
router.post("/validation/getotp", async (req, res) => {
  const { users } = req.body;

  if (!users) {
    return res.status(400).json({ code: 400, message: "Data tidak valid" });
  }

  let method;
  if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
    method = "email";
  } else if (users.match(/^[0-9]+$/) && users.length > 9) {
    method = "phone";
  } else {
    return res.status(400).json({ code: 400, message: "Data tidak valid" });
  }

  try {
    // Cari user berdasarkan email atau phone
    const user = await prisma.user.findFirst({
      where: method === "email" ? { email: users } : { phone: users },
    });

    if (!user) {
      return res.status(404).json({ code: 404, message: "User tidak ditemukan" });
    }

    // Hapus OTP lama yang sudah expired
    await prisma.oTP.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    });

    // Buat OTP baru
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit dari sekarang

    // Simpan OTP ke database
    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        method: method,
        expiresAt: expiresAt,
      },
    });

    // Kirim OTP sesuai metode
    if (method === "email") {
      await sendEmail(user.email, user.username, otpCode);
    } else {
      console.log(`Kirim OTP ke WhatsApp: ${user.phone}, Kode: ${otpCode}`);
    }

    res.status(200).json({
      code: 200,
      message: "OTP berhasil dikirim",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Terjadi kesalahan server" });
  }
});



module.exports = router;
