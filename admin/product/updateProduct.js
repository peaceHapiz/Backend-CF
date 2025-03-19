const express = require('express');
const router = express.Router();
const prisma = require('../../src/model/model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './file/shop';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const filterImage = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("❌ Tipe file tidak sesuai. Harap gunakan format JPEG, JPG, atau PNG."), false);
    }
};

// Konfigurasi multer
const upload = multer({
    storage,
    fileFilter: filterImage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Maksimal 5MB
});

router.put('/edit-shop', upload.single('picture'), async (req, res) => {
    try {
        const { productId, alias, name, description, price } = req.body;
        
        // **Cek apakah produk ada berdasarkan productId**
        const existingProduct = await prisma.shop.findUnique({ where: { productId: parseInt(productId, 10) } });
        if (!existingProduct) {
            return res.status(404).json({ code: 404, message: "❌ Produk tidak ditemukan!" });
        }

        let picture = existingProduct.picture; // **Gunakan gambar lama sebagai default**

        // **Jika ada file yang diunggah, gunakan file tersebut**
        if (req.file) {
            picture = `/file/shop/${req.file.filename}`;
        } else if (!picture) {
            picture = `/file/shop/default.jpg`; // **Gunakan default jika tidak ada file**
        }

        // **Update produk**
        const updatedProduct = await prisma.shop.update({
            where: { productId: parseInt(productId, 10) },
            data: {
                alias,
                name,
                description,
                picture,
                price: parseInt(price, 10),
                isReady: true
            }
        });

        res.status(200).json({
            code: 200,
            message: "✅ Produk berhasil diperbarui!",
            data: updatedProduct
        });

    } catch (error) {
        console.error("❌ Error saat mengupdate produk:", error);
        res.status(500).json({
            code: 500,
            message: "❌ Terjadi kesalahan server!",
            error: error.message
        });
    }
});

module.exports = router;
