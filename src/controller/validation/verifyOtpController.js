const express = require('express')
const prisma  = require('../../model/model')
const router = express.Router()

router.post("/validation/verifyotp", async (req, res) => {
    const { users, otp } = req.body;
  
    if(!users){
      return res.status(400).json({ code: 400, message: "Masukkan Users" });
    }

    if(!otp){
      return res.status(400).json({ code: 400, message: "Masukkan OTP" });
    }

    const otpString = otp.toString();
  
    let method;
    if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
      method = "email";
    } else if (users.match(/^[0-9]+$/) && users.length > 9) {
      method = "phone";
    } else {
      return res.status(400).json({ code: 400, message: "Data tidak valid" });
    }
  
    try {

      const user = await prisma.user.findFirst({
        where: method === "email" ? { email: users } : { phone: users },
      });
  
      if (!user) {
        return res.status(404).json({ code: 404, message: "User tidak ditemukan" });
      }
  

      const otpRecord = await prisma.oTP.findFirst({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() },
        },
      });
  
      if (!otpRecord) {
        return res.status(400).json({ code: 400, message: "OTP tidak valid atau sudah expired" });
      }
      console.log(otpRecord.code);
      if (otpRecord.code !== otpString) {
        return res.status(400).json({ code: 400, message: "OTP tidak valid" });
      }
      if(otpRecord.otpStatus === false){
        return res.status(400).json({ code: 400, message: "OTP sudah digunakan" });
      }
  
      // Tandai OTP sebagai sudah digunakan

      if(user.role === "keluarga_siswa" || user.role === "alumni"){
        const userUpdate = await prisma.user.update({
          where: { id: user.id },
          data: { 
            verified: true,
            add_verified : false
          },
        });
  
        const otpUpdate = await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { otpStatus: false },
        });

        res.status(200).json({
          code: 200,
          message: "OTP berhasil diverifikasi",
          data : {
            username : userUpdate.username,
            verified : userUpdate.verified,
            add_verified : userUpdate.add_verified,
            otpStatus : otpUpdate.otpStatus
          }
        });
        
      }else {
        const userUpdate = await prisma.user.update({
          where: { id: user.id },
          data: { 
            verified: true,
            add_verified : true
          },
        });
  
        const otpUpdate = await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { otpStatus: false },
        });

        res.status(200).json({
          code: 200,
          message: "OTP berhasil diverifikasi",
          data : {
            username : userUpdate.username,
            verified : userUpdate.verified,
            add_verified : userUpdate.add_verified,
            otpStatus : otpUpdate.otpStatus
          }
        });
      }

      
  
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: "Terjadi kesalahan server" });
    }
  });

  module.exports =  router