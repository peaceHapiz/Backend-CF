const express= require('express')
const router = express.Router()
const prisma = require('../../src/model/model')


router.get('/getall', async(req,res) => {
    const getAllUser = await prisma.user.findMany()

    res.json(getAllUser)
    console.log(getAllUser)
})


module.exports = router