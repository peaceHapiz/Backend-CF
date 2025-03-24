const express = require('express')
const router = express.Router()
const prisma = require('../../model/model')
const nodemailer = require('nodemailer')

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(email, name, otpCode) {
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
    from: 'noreply@chemicfest9.site',
    to: email,
    subject: 'Reset Password Chemicfest#8',
    html: `
    <head>
      <title>Reset Password</title>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
      <meta content="width=device-width" name="viewport">
    </head>
    <body style="background-color: #f4f4f5; text-align: center; font-family: Arial, sans-serif;">
      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff; max-width: 600px; margin: auto; padding: 20px;">
        <tr>
          <td style="font-size: 20px; font-weight: bold; padding-bottom: 10px;">Halo, ${name}</td>
        </tr>
        <tr>
          <td style="font-size: 16px; color: #555;">Gunakan kode OTP berikut untuk mengatur ulang password Anda:</td>
        </tr>
        <tr>
          <td style="font-size: 24px; font-weight: bold; color: #F39829; padding: 20px 0;">${otpCode.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #777;">Kode ini berlaku selama 5 menit.</td>
        </tr>
        <tr>
          <td style="padding-top: 20px;">
            <a href="http://localhost:3000/" style="display: inline-block; padding: 12px 24px; background-color: #F39829; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
          </td>
        </tr>
      </table>
    </body>
    `
  };

  return transporter.sendMail(mailOptions);
}




router.post('/request-forgot', async(req,res) => {
    const {users} = req.body
    
   

    try {
        if (
            users.toString().match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
          ) {
            var method = "email";
            var userss = users;
          } else if (users.toString().match(/^[0-9]+$/) && users.length > 9) {
            var method = "phoneNumber";
            var userss = users;
          } else if (users.toString().length === 20 && users.toString().match(/^[0-9]+$/)){
            var method = "id";
            var userss = parseInt(users);
          } else {
            var method = "username";
            var userss = users;
          }
    
        const findUsername = await prisma.user.findFirst({
            where: { [method]: userss },
         });
    
        if(!findUsername){
            return res.json({code : 404, message : "User tidak ditemukan"})
        }
    
        const otpCode = generateOTP();

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
        const activeOTP = await prisma.forgot.findFirst({
            where : {
                userId : findUsername.id
            }
        })
    
        if(activeOTP &&activeOTP.forgotStatus == true){
            return res.status(400).json({code : 400, message : "OTP sedang aktif, coba 5 menit lagi"})
        }
    
        await prisma.forgot.create({
            data : {
                userId : findUsername.id,
                forgotCode : parseInt(otpCode),
                expiredTime : expiresAt,
                forgotStatus : true
            }
        })

        await sendEmail(findUsername.email, findUsername.name, otpCode)

        return res.status(200).json({code : 200, message : "OTP berhasil dikirim"})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({code : 500, message : error.message})
    }
})

module.exports = router