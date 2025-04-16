const express = require("express");
const router = express.Router();
const prisma = require("../../src/model/model");

router.post('/second-verified', async(req,res) => {
    const {userId} = req.body

    try {
        const findUser = await prisma.user.findFirst({
            where : {
                id : userId
            }
        })

        if(!findUser){
            return res.status(404).json({code : 404, message : "User not found"})
        }

        if(findUser.add_verified){
            return res.status(400).json({code : 400, message : "User already verified"})
        }

        const verifUser = await prisma.user.update({
            where : {
                email : findUser.email
            },
            data : {
                add_verified : true
            }
        })

        return res.status(200).json({code : 200, message : `User ${findUser.username} succesfully verified`, data : verifUser})
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error", detail: error.message });
    }
})

module.exports = router