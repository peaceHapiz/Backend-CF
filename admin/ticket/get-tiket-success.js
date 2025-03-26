const express = require('express')
const app = express()
const router = express.Router()
const prisma  = require('../../src/model/model')

router.get('/get-ticket-success', async(req,res) => {
    try {
        //ambil semua tiket yang sudah dibeli
        const getTiket = await prisma.ticketTransaction.findMany({
            where : {
                paymentStatus : "successful",
            },
            include: {
                user: {
                    select : {
                        username : true,
                        id : true,
                        email: true,
                        name : true
                    }
                },
                tickets: {
                    select : {
                        bookingCode : true,
                        passCode : true,
                        isScanned : true,
                        urlTicket : {
                            select : {
                                barcode : true,
                                eTicket : true,
                                qrcode : true,
                                ticketId : true
                        }
                    }
                },
                
            }
        }})

        

        res.status(200).json({code : 200, message: 'Success', data: getTiket})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({code : 500, message: 'Internal server error', error : error.message})
    }
})

module.exports = router