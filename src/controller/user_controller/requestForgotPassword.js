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
    <!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password OTP</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-200 flex justify-center items-center min-h-screen">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
      <h2 class="text-2xl font-bold text-red-600">Reset Password</h2>
      <p class="mt-2 text-gray-700">Gunakan kode berikut untuk mereset password Anda:</p>
      <h1 class="mt-4 text-4xl font-bold text-gray-900">${otpCode}</h1>
      <p class="mt-2 text-sm text-gray-500">Kode ini hanya berlaku selama 5 menit.</p>
    </div>
  </body>
</html>
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