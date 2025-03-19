const express = require('express')
const router = express.Router()
const prisma = require('../../model/model')

router.post('/checkhave/product', async (req,res) => {
    const {userId} = req.body

    try {
        const transaction = await prisma.productTransaction.findMany({
            where : {
                userId : userId,
                payment : {
                    status : "succesful"
                }
            }, 
            include : {
                payment : true
            }
        })

        if(transaction.length > 0){
            return res.status(200).json({code : 200, data : transaction})
        }

        return res.status(404).json({code : 404, message : "User  belum membeli product"})

    } catch (error) {
        res.status(500).json({code : 500, message : error.message})
        console.log(error.message)
    }
})

module.exports = router