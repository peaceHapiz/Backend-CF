const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Menggunakan memoryStorage agar file tidak langsung disimpan
const storage = multer.memoryStorage();

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

// Endpoint tambah sponsor
router.post("/add-sponsor", upload.single("sponsorImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "❌ Gambar sponsor diperlukan!" });
        }
        if (!req.body.sponsorName) {
            return res.status(400).json({ message: "❌ Nama sponsor diperlukan!" });
        }

        const sponsorName = req.body.sponsorName.trim().replace(/\s+/g, "_"); // Hindari spasi
        const ext = path.extname(req.file.originalname);
        const sponsorImage = `${sponsorName}${ext}`;
        const sponsorUrl = `/file/sponsor/${sponsorImage}`;

        // Baca file JSON
        const filePath = "./db/sponsor.json";
        let sponsorData = [];

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, "utf8");
            sponsorData = JSON.parse(fileContent);
        }

        let newId = sponsorData.length > 0 ? Math.max(...sponsorData.map(s => parseInt(s.id))) + 1 : 1;

        // Cek apakah sponsor sudah ada
        const existingSponsor = sponsorData.find(s => s.sponsorName === sponsorName);
        if (existingSponsor) {
            return res.status(400).json({ message: "❌ Sponsor sudah ada." });
        }

        // **Simpan data sponsor ke JSON dulu (pastikan sukses)**
        const newSponsor = { id: newId, sponsorName, sponsorImage, sponsorUrl };
        sponsorData.push(newSponsor);
        fs.writeFileSync(filePath, JSON.stringify(sponsorData, null, 2));

        // **Baru simpan file ke disk**
        const uploadDir = path.join("./file/sponsor");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, sponsorImage), req.file.buffer);

        res.json({
            message: `✅ Sponsor ${sponsorName} berhasil ditambahkan.`,
            sponsor: newSponsor,
        });

    } catch (error) {
        res.status(500).json({ message: "❌ Terjadi kesalahan pada server.", error: error.message });
    }
});

module.exports = router;
