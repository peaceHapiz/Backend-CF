const express = require('express');
const prisma = require('../../model/model');
const router = express.Router();

router.get('/get-ticket', async (req, res) => {
    try {
        const getTiket = await prisma.ticketOffline.findMany({
            where: {
                isReady: true
            }
        });

        return res.status(200).json({
            code: 200,
            message: "Tiket ditemukan",
            data: getTiket
        });
    } catch (error) {
        console.error("Error saat mengambil tiket:", error.message);

        return res.status(500).json({
            code: 500,
            message: "Internal server error"
        });
    }
});

module.exports = router;
