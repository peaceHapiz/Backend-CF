const express = require('express')
const prisma = require('../../model/model')
const router = express.Router()
const axios = require('axios')
const nodemailer = require('nodemailer')



router.post("/login", async (req,res) => {
    try {
        const {users , password} = req.body

    if (!users || !password) {
        return res.status(400).json({ code: 400, message: "Data tidak valid" });
    }

    if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        var method = "email";
      } else if (users.match(/^[0-9]+$/) && users.length > 9) {
        var method = "phone";
      } else {
        var method = "username";
      }

    
    
    const findUsername = await prisma.user.findFirst({
        where: { [method]: users },
     });

    if (findUsername){
        if(findUsername.password === password){
             if(findUsername.verified == false){
                 res.status(403).json({code : 403, message : "Verifikasi belum dilakukan, Mohon lakukan verifikasi terlebih dahulu"})
                 return;
             }

             

            const now  = new Date()
            const expiresSession = new Date(now);
            expiresSession.setDate(now.getDate() + 1);
                
             const insertSession = await prisma.session.create({
                data : {
                    userId : findUsername.id,
                    isActive : true,
                    expiresAt : expiresSession
                }
             })

             res.status(200).json({
                code : 200,
                 message : "Login Terdeteksi",
                sessionId : insertSession.id,
                expiredAt : expiresSession,
                userData : findUsername
             })

             console.log(`Login terdeteksi username : ${findUsername.username}, expired : ${expiresSession}`)
          }
     }
    } catch (error) {
        console.error(error);
    res.status(500).json({ code: 500, message: "Terjadi kesalahan server" });
    }


    
    

})


module.exports = router;

