const express = require('express')
const router = express.Router()
const prisma  = require('../../src/model/model')


router.delete('/delete-ticket', async (req,res)=>{
    const {ticketId}  = req.body

    try {
        const findTicket = await prisma.ticketOffline.findUnique({
            where : {
                productId : ticketId
            },
           
        })

        if(!findTicket){
            return res.status(500).json({
                code : 500,
                message : "Ticket tidak ada"
            })
        }

        const deleteTicket = await prisma.ticketOffline.delete({
            where : {
                productId : ticketId
            }
        })

        res.status(200).json({
            code : 200,
            message : `Ticket dengan id = ${ticketId} dan nama = ${findTicket.alias}`
        })
    } catch (error) {
        console.error("❌ Error saat mengedit tiket:", error);
        res.status(500).json({ code: 500, message: "❌ Terjadi kesalahan server!", error: error.message });
    }
})

module.exports = router