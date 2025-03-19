const express = require('express')
const prisma = require('../../model/model')
const router = express.Router()

router.get('/get/tiket', async(req,res) => {
    try {
        const getTiket = await prisma.ticketOffline.findMany()

        res.json(200).json({code : 200, message : "Tiket ditemukan", data : getTiket})
    } catch (error) {
        res.json(500).json({code : 500, message : "Internal server error"})
        console.log(error.message)
    }

})

module.exports = router