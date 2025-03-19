const express = require('express');
const router = express.Router();
const prisma = require('../../src/model/model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.delete('/delete-shop', async (req, res) => {
    try {
        const { productId } = req.body;

        // **Cek apakah produk ada berdasarkan productId**
        const existingProduct = await prisma.shop.findUnique({
            where: { productId: parseInt(productId, 10) }
        });

        if (!existingProduct) {
            return res.status(404).json({ code: 404, message: "❌ Produk tidak ditemukan!" });
        }

        // **Hapus file gambar jika bukan default**
        if (existingProduct.picture && !existingProduct.picture.includes("default.jpg")) {
            const filePath = `.${existingProduct.picture}`; // Path relatif ke gambar
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Hapus gambar
            }
        }

        // **Hapus produk dari database**
        await prisma.shop.delete({
            where: { productId: parseInt(productId, 10) }
        });

        res.status(200).json({
            code: 200,
            message: `✅ Produk dengan ID ${productId} berhasil dihapus!`
        });

    } catch (error) {
        console.error("❌ Error saat menghapus produk:", error);
        res.status(500).json({
            code: 500,
            message: "❌ Terjadi kesalahan server!",
            error: error.message
        });
    }
});

module.exports = router;
