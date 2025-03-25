const express  = require('express')
const router = express.Router()
const prisma  = require('../../src/model/model')

router.post('/scan-ticket', async(req,res) => {
    const {ticket} = req.body

    try {
        const getTicket = await prisma.urlTicket.findUnique({
            where: {
                barcode: ticket
            },
            include : {
                ticket : {
                    include : {
                        user : {
                            select : {
                                username : true,
                                email : true
                            }
                    }
            }}
        }})

        if(!getTicket){
            return res.status(404).json({message: "Ticket tidak ditemukan"})
        }

        if(getTicket.ticket.isScanned){
            return res.status(400).json({message: "Ticket sudah di scan"})
        }

        await prisma.ticket.update({
            where: {
                id : getTicket.ticketId
            },
            data: {
                isScanned: true
            }
        })

        res.status(200).json({code : 200, message : `user ${getTicket.ticket.user.username} berhasil scan ticket`})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({code : 500, message : error.message})
    }
})