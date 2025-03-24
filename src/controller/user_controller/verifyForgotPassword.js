const express = require('express');  
const prisma = require('../../model/model');
const router = express.Router();
const nodemailer = require('nodemailer');

async function sendEmail(email) {
  var transporter = nodemailer.createTransport({
    host: 'mx5.mailspace.id',
    port: 465,
    secure: true,
    auth: {
      user: 'noreply@lockify.space',
      pass: '@Sandiku197'
    },
    debug: true
  });

  var mailOptions = {
    from: `noreply@chemicfest9.site`,
    to: `${email}`,
    subject: "Reset Password Chemicfest#8",
    html: `<p>Your password has been reset successfully.</p>`
  };
  return transporter.sendMail(mailOptions);
}

router.post('/verify-forgot', async (req, res) => {
  const { users, token, password, confirm_password } = req.body;

  try {
    let method;
    let userss;
    if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
      method = "email";
      userss = users;
    } else if (users.match(/^[0-9]+$/) && users.length > 9) {
      method = "phoneNumber";
      userss = users;
    } else if (users.length === 20 && users.match(/^[0-9]+$/)) {
      method = "id";
      userss = parseInt(users);
    } else {
      method = "username";
      userss = users;
    }

    const findUser = await prisma.user.findUnique({
      where: { [method]: userss },
    });
    
    if (!findUser) {
      return res.status(404).json({ code: 404, message: "User tidak ditemukan" });
    }
    
    // Ambil forgot password terbaru untuk user ini
    const forgotData = await prisma.forgot.findFirst({
      where: { 
        userId: findUser.id, 
        forgotStatus: true // Hanya ambil yang masih aktif
      },
      orderBy: { expiredTime: 'desc' }, // Urutkan berdasarkan waktu kadaluarsa terbaru
    });
    
    if (!forgotData) {
      return res.status(400).json({ code: 400, message: "Token tidak ditemukan atau sudah kadaluarsa" });
    }
    
    const code = forgotData.forgotCode;
    
    if (code !== parseInt(token)) {
      return res.status(400).json({ code: 400, message: "Token salah" });
    }
    
    if (forgotData.expiredTime < new Date()) {
      return res.status(400).json({ code: 400, message: "Token telah kadaluarsa" });
    }
    
    if (!forgotData.forgotStatus) {
      return res.status(400).json({ code: 400, message: "Token telah digunakan" });
    }

    if (password.length < 8) {
      return res.status(426).json({ code: 426, message: "Password must be at least 8 characters" });
    }
    if (!password.match(/[a-z]/g)) {
      return res.status(427).json({ code: 427, message: "Password must contain at least one lowercase letter" });
    }
    if (!password.match(/[A-Z]/g)) {
      return res.status(428).json({ code: 428, message: "Password must contain at least one uppercase letter" });
    }
    if (!password.match(/[0-9]/g)) {
      return res.status(429).json({ code: 429, message: "Password must contain at least one number" });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ code: 430, message: "Confirm Password Not Match" });
    }

    await prisma.user.update({
      where: { id: findUser.id },
      data: { password: password }
    });

    await prisma.forgot.update({
      where: { id: forgotData.id },
      data: { forgotStatus: false }
    });

    await sendEmail(findUser.email);
    return res.status(200).json({ code: 200, message: "Password Berhasil Diubah" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
