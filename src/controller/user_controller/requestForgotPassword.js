const express = require('express')
const router = express.Router()
const prisma = require('../../model/model')
const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    host: 'mx5.mailspace.id',
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: 'noreply@lockify.space',
      pass: '@Sandiku197'
    },
    debug: true
  });

  var mailOptions = {
    from: 'botsinchan@gmail.com',
    to: 'masterofmoney88@gmail.com',
    subject: 'Reset Password Chemicfest#8',
    html: `
    <head>
      <title>Reset Password</title>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
      <meta content="width=device-width" name="viewport">
      <style type="text/css">
                  @font-face {
                    font-family: &#x27;Postmates Std&#x27;;
                    font-weight: 600;
                    font-style: normal;
                    src: local(&#x27;Postmates Std Bold&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-bold.woff) format(&#x27;woff&#x27;);
                  }
      
                  @font-face {
                    font-family: &#x27;Postmates Std&#x27;;
                    font-weight: 500;
                    font-style: normal;
                    src: local(&#x27;Postmates Std Medium&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-medium.woff) format(&#x27;woff&#x27;);
                  }
      
                  @font-face {
                    font-family: &#x27;Postmates Std&#x27;;
                    font-weight: 400;
                    font-style: normal;
                    src: local(&#x27;Postmates Std Regular&#x27;), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-regular.woff) format(&#x27;woff&#x27;);
                  }
              </style>
      <style media="screen and (max-width: 680px)">
                  @media screen and (max-width: 680px) {
                      .page-center {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                      }
                      
                      .footer-center {
                        padding-left: 20px !important;
                        padding-right: 20px !important;
                      }
                  }
              </style>
      </head>
      <body style="background-color: #f4f4f5;">
      <table cellpadding="0" cellspacing="0" style="width: 100%; height: 100%; background-color: #f4f4f5; text-align: center;">
      <tbody><tr>
      <td style="text-align: center;">
      <table align="center" cellpadding="0" cellspacing="0" id="body" style="background-color: #fff; width: 100%; max-width: 680px; height: 100%;">
      <tbody><tr>
      <td>
      <table align="center" cellpadding="0" cellspacing="0" class="page-center" style="text-align: left; padding-bottom: 88px; width: 100%; padding-left: 120px; padding-right: 120px;">
      <!-- <tbody><tr>
      <td style="padding-top: 24px;">
      <img src="https://chemicfest.site/file/assets/text-logo.png" style="width: 192px; height: 48px;">
      </td>
      </tr> -->
      <tr>
      <td colspan="2" style="padding-top: 72px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 48px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none;">Reset your password</td>
      </tr>
      <tr>
      <td style="padding-top: 48px; padding-bottom: 48px;">
      <table cellpadding="0" cellspacing="0" style="width: 100%">
      <tbody><tr>
      <td style="width: 100%; height: 1px; max-height: 1px; background-color: #d9dbe0; opacity: 0.81"></td>
      </tr>
      </tbody></table>
      </td>
      </tr>
      <tr>
      <td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                            You're receiving this e-mail because you requested a password reset for your Postmates account.
                                          </td>
      </tr>
      <tr>
      <td style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                            Please tap the button below to choose a new password.
                                          </td>
      </tr>
      <tr>
      <td>
      <a data-click-track-id="37" href="https://chemicfest.com/reset-password" style="margin-top: 36px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #ffffff; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 12px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: 0.7px; line-height: 48px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 220px; background-color: #F39829; border-radius: 28px; display: block; text-align: center; text-transform: uppercase" target="_blank">
                                              Reset Password
                                            </a>
      </td>
      </tr>
      </tbody></table>
      </td>
      </tr>
      </tbody></table>
      <table align="center" cellpadding="0" cellspacing="0" id="footer" style="background-color: #000; width: 100%; max-width: 680px; height: 100%;">
      <tbody><tr>
      <td>
      <table align="center" cellpadding="0" cellspacing="0" class="footer-center" style="text-align: left; width: 100%; padding-left: 120px; padding-right: 120px;">
      <tbody><tr>
      <td colspan="2" style="padding-top: 72px; padding-bottom: 24px; width: 100%;">
      <img src="https://chemicfest.site/file/assets/text-logo.png" style="width: 196px; height: 48px">
      </td>
      </tr>
      <tr>
      <td colspan="2" style="padding-top: 24px; padding-bottom: 48px;">
      <table cellpadding="0" cellspacing="0" style="width: 100%">
      <tbody><tr>
      <td style="width: 100%; height: 1px; max-height: 1px; background-color: #EAECF2; opacity: 0.19"></td>
      </tr>
      </tbody></table>
      </td>
      </tr>
      <tr>
      <td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095A2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                                If you have any questions or concerns, we're here to help. Contact us via our <a data-click-track-id="1053" href="https://support.postmates.com/buyer" style="font-weight: 500; color: #ffffff" target="_blank">Help Center</a>.
                                              </td>
      </tr>
      <tr>
      <td style="height: 72px;"></td>
      </tr>
      </tbody></table>
      </td>
      </tr>
      </tbody></table>
      </td>
      </tr>
      </tbody></table>
      
      
      
      </body>
    `
  };

router.post('/request-forgot-password', async(req,res) => {
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
            res.json({code : 404, message : "User tidak ditemukan"})
        }
    
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
        const activeOTP = await prisma.forgot.findFirst({
            where : {
                userId : findUsername.id
            }
        })
    
        if(activeOTP.forgotStatus == true){
            res.json(400).json({code : 400, message : "OTP sedang aktif, coba 5 menit lagi"})
        }
    
        await prisma.forgot.create({
            data : {
                userId : findUsername.id,
                code : otpCode,
                method : method,
                expiresAt : expiresAt,
                forgotStatus : true
            }
        })

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        })
    } catch (error) {
        console.log(error.message)
        res.json(500).json({code : 500, message : error.message})
    }
})
