const express = require('express');
const router = express.Router();
const prisma = require('../../src/model/model')



router.get('/get-all', async(req,res) => {
    try {
        const data = await prisma.ticketOffline.findMany()

        res.status(200).json({
            code : 200,
            message : "Data ditemukan",
            data : data
        })
    } catch (error) {
        console.log(error.message)
    }
})

module.exports = router