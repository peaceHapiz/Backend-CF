const express = require('express')  
const prisma = require('../../model/model')
const router = express.Router()
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
    from: user,
    to: email,
    subject: "Reset Password Chemicfest#8",
    html: `
    <head>
<title>Your Account Has Ben Reset</title>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
<meta content="width=device-width" name="viewport">
<style type="text/css">
  @font-face {
    font-family: &#x27;
    Postmates Std&#x27;
    ;
    font-weight: 600;
    font-style: normal;
    src: local(&#x27; Postmates Std Bold&#x27; ), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-bold.woff) format(&#x27; woff&#x27; );
  }

  @font-face {
    font-family: &#x27;
    Postmates Std&#x27;
    ;
    font-weight: 500;
    font-style: normal;
    src: local(&#x27; Postmates Std Medium&#x27; ), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-medium.woff) format(&#x27; woff&#x27; );
  }

  @font-face {
    font-family: &#x27;
    Postmates Std&#x27;
    ;
    font-weight: 400;
    font-style: normal;
    src: local(&#x27; Postmates Std Regular&#x27; ), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-regular.woff) format(&#x27; woff&#x27; );
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
<table cellpadding="0" cellspacing="0"
  style="width: 100%; height: 100%; background-color: #f4f4f5; text-align: center;">
  <tbody>
    <tr>
      <td style="text-align: center;">
        <table align="center" cellpadding="0" cellspacing="0" id="body"
          style="background-color: #fff; width: 100%; max-width: 680px; height: 100%;">
          <tbody>
            <tr>
              <td>
                <table align="center" cellpadding="0" cellspacing="0" class="page-center"
                  style="text-align: left; padding-bottom: 88px; width: 100%; padding-left: 120px; padding-right: 120px;">
                  <!-- <tbody><tr>
  <td style="padding-top: 24px;">
  <img src="https://chemicfest.site/file/assets/text-logo.png" style="width: 192px; height: 48px;">
  </td>
  </tr> -->
                  <tr>
                    <td colspan="2"
                      style="padding-top: 72px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 48px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none;">
                      Your Password has been Reset</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 48px; padding-bottom: 48px;">
                      <table cellpadding="0" cellspacing="0" style="width: 100%">
                        <tbody>
                          <tr>
                            <td
                              style="width: 100%; height: 1px; max-height: 1px; background-color: #d9dbe0; opacity: 0.81">
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                      You're receiving this e-mail because you make a password reset for your Chemicfest account.
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                      This is location of request has been made.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <a href="${url}" target="_blank">
                        <img src="${maps}" width="300px" height="200px" style="border:0;" alt="Map Image">
                      </a>
                    </td>
                  </tr>                                
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
<table align="center" cellpadding="0" cellspacing="0" id="footer"
  style="background-color: #1E2124; width: 100%; max-width: 680px; height: 100%;">
  <tbody>
    <tr>
      <td>
        <table align="center" cellpadding="0" cellspacing="0" class="footer-center"
          style="text-align: left; width: 100%; padding-left: 120px; padding-right: 120px;">
          <tbody>
            <tr>
              <td colspan="2" style="padding-top: 72px; padding-bottom: 24px; width: 100%;">
                <a href="https://chemicfest.com">
                  <img src="https://chemicfest.site/file/assets/text-logo.png" style="width: 196px; height: 48px">
                </a>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 24px; padding-bottom: 48px;">
                <table cellpadding="0" cellspacing="0" style="width: 100%">
                  <tbody>
                    <tr>
                      <td style="width: 100%; height: 1px; max-height: 1px; background-color: #EAECF2; opacity: 0.19">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td
                style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095A2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                Manage by <a href="https://instagram.com/chemicevents" style="color: #9095A2; text-decoration: none;" target="_blank">OSIS SMK SMTI YOGYAKARTA</a>
              </td>
            </tr>
            <tr>
              <td style="-ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095A2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                &copy; <strong>Chemicfest</strong> 2024 | All Rights Reserved | <a href="https://chemicfest.com" style="color: #9095A2; text-decoration: none;" target="_blank">Chemicfest.com</a>
              </td>
            </tr>              
              <td style="height: 72px;"></td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
</td>
</tr>
</tbody>
</table>
</body>
        `,
  };

router.post('/verify-forgot-password', async(req,res) => {
    const {users, token, password, confirm_password} = req.body

    
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
    
        const findUser = await prisma.forgot.findFirst({
            where : {
                [method] : users,
            }
        })
    
        if(!findUser){
            return res.json({code : 404, message : "User tidak ditemukan"})
        }
    
        if(findUser.token !== token){
            return res.json({code : 400, message : "Token salah"})
        }
    
        if(findUser.expiredAt < new Date()){
            return res.json({code : 400, message : "Token telah kadaluarsa"})
        }
    
        if(findUser.forgotStatus === false){
            return res.json({code : 400, message : "Token telah digunakan"})
        }
    
        if (password.length < 8) {
            return res
              .status(426)
              .json({ code: 426, message: "Password must be at least 8 characters" });
          }
    
          if (!password.match(/[a-z]/g)) {
            return res.status(427).json({
              code: 427,
              message: "Password must contain at least one lowercase letter",
            });
          }
    
          if (!password.match(/[A-Z]/g)) {
            return res.status(428).json({
              code: 428,
              message: "Password must contain at least one uppercase letter",
            });
          }
    
          if (!password.match(/[0-9]/g)) {
            return res.status(429).json({
              code: 429,
              message: "Password must contain at least one number",
            });
          }
    
        if(password !== confirm_password){
            return res.status(400).json({ code: 430, result: false, message: "Confirm Password Not Match" });
        }
    
        const updatePassword = await prisma.user.update({
            where : {
                id : findUser.userId
            },
            data : {
                password : password
            }
        })
    
        await prisma.forgot.update({
            where : {
                id : findUser.id
            },
            data : {
                forgotStatus : false
            }
        })
    
        res.status(200).json({code : 200, message : "Password Berhasil Diubah"})
    } catch (error) {
        res.json({code : 500, message : error.message})
        console.log(error.message)
    }
})