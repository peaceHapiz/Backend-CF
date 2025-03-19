const express = require('express');
const router = express.Router();
const prisma = require('../../src/model/model');

router.put('/edit-ticket', async (req, res) => {
    const { ticketId, alias, name, price } = req.body;

    try {
        // Cari tiket berdasarkan productId
        const findTicket = await prisma.ticketOffline.findUnique({
            where: { productId: ticketId }
        });

        // Jika tiket tidak ditemukan
        if (!findTicket) {
            return res.status(404).json({ code: 404, message: "❌ Tiket tidak ditemukan!" });
        }

        // Update tiket
        const updateTicket = await prisma.ticketOffline.update({
            where: { productId: ticketId },
            data: {
                alias: alias || findTicket.alias,  // Jika alias tidak diubah, tetap pakai yang lama
                name: name || findTicket.name,     // Sama dengan name
                price: price !== undefined ? price : findTicket.price // Sama dengan price
            }
        });

        res.status(200).json({
            code: 200,
            message: "✅ Tiket berhasil diperbarui!",
            data: updateTicket
        });

    } catch (error) {
        console.error("❌ Error saat mengedit tiket:", error);
        res.status(500).json({ code: 500, message: "❌ Terjadi kesalahan server!", error: error.message });
    }
});

module.exports = router;
