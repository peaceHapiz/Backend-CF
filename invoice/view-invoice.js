const express = require('express');
const router = express.Router();
const prisma = require('../src/model/model'); 
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;


        
        console.log(req.params)
        const data = await prisma.payment.findUnique({
            where : {
                orderId : orderId
            },

        })

        

        res.status(200).json({ code: 200, message: "Ticket found", data: ticket });

    } catch (error) {
        console.error("Error fetching ticket:", error.message);
        res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
});

module.exports = router;
