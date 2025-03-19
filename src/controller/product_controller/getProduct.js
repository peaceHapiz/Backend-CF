const express = require('express')
const prisma = require('../../model/model')
const router = express.Router()

router.get('get/product', async(req,res) => {
    try {
        const getProduct = await prisma.product.findMany()

        res.json(200).json({code : 200, message : "Product ditemukan", data : getProduct})


    } catch (error) {
        res.json(500).json({code : 500, message : "Internal server error"})
        console.log(error.message)
    }
})
module.exports = router