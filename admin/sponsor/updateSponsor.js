const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const filePath = "./db/sponsor.json"; // Path ke file JSON

// Konfigurasi multer untuk upload gambar
const storage = multer.memoryStorage();

const filterImage = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log("❌ Tipe file tidak sesuai.");
        cb(new Error("❌ Tipe file tidak sesuai. Harap gunakan format JPEG, JPG, atau PNG."), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: filterImage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Maksimum 5MB
});

router.put("/update-sponsor", upload.single("sponsorImage"), async (req, res) => {
    try {
        let { id, sponsorName, sponsorUrl } = req.body;
        const file = req.file;

        if (!id) {
            return res.status(400).json({ message: "❌ ID sponsor diperlukan!" });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "❌ File sponsor tidak ditemukan!" });
        }

        // Baca data sponsor dari file JSON
        let sponsors = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Cari sponsor berdasarkan ID
        let sponsorIndex = sponsors.findIndex((s) => s.id == id);
        if (sponsorIndex === -1) {
            return res.status(404).json({ message: "❌ Sponsor tidak ditemukan!" });
        }

        // Data sponsor lama
        let oldSponsor = sponsors[sponsorIndex];

        // Hapus file gambar lama jika ada file baru yang diupload
        if (file && oldSponsor.sponsorImage !== "default-image.png") {
            let oldImagePath = path.join('./file/sponsor', oldSponsor.sponsorImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        const ext = path.extname(req.file.originalname);
        const uploadDir = path.join('./file/sponsor');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        const sponsorImage = `${sponsorName}${ext}`;
        fs.writeFileSync(path.join(uploadDir, sponsorImage), file.buffer);

        sponsors.splice(sponsorIndex, 1);
        

        if(!sponsorUrl){
            sponsorUrl = `./file/sponsor/${sponsorImage}`
        }
        const newSponsor = {
            id: id,
            sponsorName: sponsorName || oldSponsor.sponsorName,
            sponsorImage: sponsorImage,
            sponsorUrl: sponsorUrl ,
        };

        // Tambahkan sponsor baru ke dalam array
        sponsors.push(newSponsor);

        // Simpan kembali ke file JSON
        fs.writeFileSync(filePath, JSON.stringify(sponsors, null, 2));

        res.json({
            message: `✅ Sponsor dengan ID ${id} berhasil diperbarui.`,
            sponsor: newSponsor,
        });
    } catch (error) {
        res.status(500).json({ message: "❌ Terjadi kesalahan pada server.", error: error.message });
    }
});

module.exports = router;
