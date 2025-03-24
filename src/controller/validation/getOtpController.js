const express = require("express");
const router = express.Router();
const prisma = require("../../model/model");
const nodemailer = require("nodemailer");

// Fungsi untuk membuat OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fungsi untuk mengirim OTP via email
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

// Endpoint untuk request OTP
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

    // Hapus OTP yang sudah expired
    await prisma.oTP.deleteMany({
      where: { userId: user.id },
    });

  

  
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    await sendEmail(user.email, user.name, otpCode);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
        otpStatus: true
      },
    });



    res.status(200).json({ code: 200, message: "OTP berhasil dikirim" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: error.message || "Terjadi kesalahan server" });
  }
});

module.exports = router;
