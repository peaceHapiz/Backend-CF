const express = require('express')
const router = express.Router()
const prisma   = require('../../src/model/model')

router.post('/manual-scanned', async(req,res) => {
    const {bookingCode} = req.body

    try {
        
        const getTicket = await prisma.ticket.findUnique({
            where: {
                bookingCode: bookingCode
            },
        })
    
        if(!getTicket){
            return res.status(404).json({message: "Ticket tidak ditemukan"})
        }
        if(getTicket.isScanned){
            return res.status(400).json({message: "Ticket sudah di scan"})
        }
    
        const updateTicket = await prisma.ticket.update({
            where: {
                bookingCode: bookingCode
            },
            data: {
                isScanned: true
            },
            include:{
                user : {
                    select: {
                        username : true,
                        email : true
                }
            }
    
        }})
    
        res.status(200).json({message: `ticket ${bookingCode} telah di scan`, dataTicket : updateTicket})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }

})

module.exports = router