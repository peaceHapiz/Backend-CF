const express = require('express');  
const prisma = require('../../model/model');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load konfigurasi dari config.json
const configPath = path.join(__dirname, '../../../db/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function sendEmail(email) {
  // const transporter = nodemailer.createTransport({
  //   host: config.EmailOTP.ProductionEmail.service,
  //   port: config.EmailOTP.ProductionEmail.port,
  //   secure: config.EmailOTP.ProductionEmail.secure,
  //   auth: {
  //     user: config.EmailOTP.ProductionEmail.user,
  //     pass: config.EmailOTP.ProductionEmail.pass,
  //   },
  //   debug: true,
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
    
    const forgotData = await prisma.forgot.findFirst({
      where: { 
        userId: findUser.id, 
        forgotStatus: true
      },
      orderBy: { expiredTime: 'desc' },
    });
    
    if (!forgotData || forgotData.forgotCode !== parseInt(token) || forgotData.expiredTime < new Date()) {
      return res.status(400).json({ code: 400, message: "Token tidak valid atau kadaluarsa" });
    }

    if (password.length < 8 || !password.match(/[a-z]/g) || !password.match(/[A-Z]/g) || !password.match(/[0-9]/g)) {
      return res.status(400).json({ code: 400, message: "Password tidak memenuhi syarat" });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ code: 400, message: "Konfirmasi password tidak cocok" });
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
