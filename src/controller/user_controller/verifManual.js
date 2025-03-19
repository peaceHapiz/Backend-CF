const express = require('express')
const router = express.Router()
const prisma = require('../../model/model')

router.post('/verif/manual', async(req,res) => {
    const {users} = req.body
    try {
        if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
            var method = "email";
          } else if (users.match(/^[0-9]+$/) && users.length > 9) {
            var method = "phone";
          } else {
            var method = "username";
          }
    
        
        
        const findUser = await prisma.user.findFirst({
            where: { [method]: users },
         });
        if(!findUser){
            return res.json({code : 404, message : "User tidak ditemukan"})
        }

        const verifUser = await prisma.user.update({
            where : {
                id : findUser.id
            },
            data : {
                verified : true
            }
        })

        res.json({code : 200, message : "Verifikasi berhasil", data : verifUser})
    } catch (error) {
        console.log(error.message)
        res.json({code : 500, message : "Internal server error", error : error.message})
    }
})

module.exports = router