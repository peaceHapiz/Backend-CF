const express = require('express')
const prisma = require('../../model/model')
const router = express.Router()

router.get('/get/user', async(req,res) => {
    const {users} = req.body

    try {
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

        if(!findUsername){
            res.json({code : 404, message : "User tidak ditemukan"})
        }   

        res.json({code : 200, message : "User ditemukan", data : findUsername})
    } catch (error) {
        res.json({code : 500, message : "Internal server error"})
        console.log(error.message)
    }
})