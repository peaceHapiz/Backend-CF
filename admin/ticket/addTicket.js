const express = require('express')
const router = express.Router()
const prisma  = require('../../src/model/model')

async function generateProductId() {
    try {

        const lastProduct = await prisma.ticketOffline.findFirst({
            orderBy: {
                productId: 'desc'  
            }
        });


        const newProductId = lastProduct ? lastProduct.productId + 1 : 1000;

        return newProductId;
    } catch (error) {
        console.error("❌ Error generating product ID:", error);
        throw new Error("Gagal membuat product ID");
    }
}


router.post('/add-ticket', async (req, res) => {
    const {alias, name, price, productId, ticket_type} = req.body

    try {
        if(!alias  ){
            return res.status(500).json({code : 500, message : "❌ Alias tidak boleh kosong"})

        }

        if(!name){
            return res.status(500).json({code : 500, message : "❌ Nama tidak boleh kosong"})
        }   

        if(!price){
            return res.status(500).json({code : 500, message : "❌ Harga tidak boleh kosong"})
        }

        if(!ticket_for){
            return res.status(500).json({code : 500, message : "❌ Role tidak boleh kosong"})
        }
        
        let newProductId = 0

        if(!productId) {
            newProductId = await generateProductId()
        } else {
            newProductId = productId
        }

        const findProduct = await prisma.ticketOffline.findUnique({
            where : {
                alias : alias
            }
        })

        if(findProduct){
            return res.status(400).json({code : 400, message : "Product sudah terdaftar"})
        }

        const addTicket = await prisma.ticketOffline.create({
            data: {
                isReady : true,
                productId : newProductId,
                alias : alias,
                name : name,
                price : price,
                ticket_type : ticket_type
            }
        })

        res.status(201).json({code : 201, message : `Ticket ${name}, berhasil ditambahkan`})
    } catch (error) {
        res.status(500).json({code : 500, message : `Error terjadi, ${error.message}`})
        console.log(error.message)
    }
})

module.exports = router