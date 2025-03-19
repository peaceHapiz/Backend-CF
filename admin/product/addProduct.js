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

// **Endpoint Menambah Produk**
router.post('/add-shop', upload.single('picture'), async (req, res) => {
    try {
        const { alias, name, description, price } = req.body;
        let picture = req.body.picture; // URL gambar dari request (jika ada)

        // **Jika ada file yang diunggah, gunakan path file**
        if (req.file) {
            picture = `/file/shop/${req.file.filename}`;
        } else if (!picture) {
            picture = `/file/shop/default.jpg`; // **Gunakan default jika tidak ada file dan URL**
        }

        // **Cek apakah alias sudah digunakan**
        const existingProduct = await prisma.shop.findUnique({ where: { alias } });
        if (existingProduct) {
            return res.status(400).json({ code: 400, message: "❌ Alias produk sudah digunakan!" });
        }

        // **Cari productId terbesar untuk menentukan ID selanjutnya**
        const lastProduct = await prisma.shop.findFirst({ orderBy: { productId: 'desc' } });
        const nextProductId = lastProduct ? lastProduct.productId + 1 : 1000;

        // **Tambah produk ke database**
        const newProduct = await prisma.shop.create({
            data: {
                productId: nextProductId,
                alias,
                name,
                description,
                picture,
                price: parseInt(price, 10),
                isReady: true
            }
        });

        res.status(201).json({
            code: 201,
            message: "✅ Produk berhasil ditambahkan!",
            data: newProduct
        });

    } catch (error) {
        console.error("❌ Error saat menambah produk:", error);
        res.status(500).json({
            code: 500,
            message: "❌ Terjadi kesalahan server!",
            error: error.message
        });
    }
});

module.exports = router;
