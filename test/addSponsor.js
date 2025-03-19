const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const router = express.Router();
const port = 2024;

// Pastikan folder penyimpanan ada
const uploadDir = path.join(__dirname, "/sponsor/file");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

// Filter file agar hanya menerima JPG, JPEG, PNG
const filterImage = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log("❌ Tipe file tidak sesuai.");
    cb(new Error("❌ Tipe file tidak sesuai. Harap gunakan format JPEG, JPG, atau PNG."), false);
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  fileFilter: filterImage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Maksimal 5MB
});

// File JSON untuk menyimpan data sponsor
const sponsorDataFile = path.join(__dirname, "/sponsor/sponsor.json");

// Pastikan file JSON ada
if (!fs.existsSync(sponsorDataFile)) {
  fs.writeFileSync(sponsorDataFile, JSON.stringify([]));
}

// Endpoint untuk menambahkan sponsor
router.post("/add-sponsor", upload.single("sponsorImage"), async (req, res) => {
  try {
    console.log("✅ Request diterima.");

    // Ambil data dari request
    const { sponsorName } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "❌ Gambar sponsor diperlukan!" });
    }

    // Pastikan sponsorName tidak kosong
    if (!sponsorName) {
      return res.status(400).json({ message: "❌ Nama sponsor diperlukan!" });
    }

    // Ambil nama file gambar yang diupload
    const sponsorImage = req.file.filename;
    const sponsorUrl = `/file/sponsor/${sponsorImage}`;

    // Baca data sponsor yang sudah ada
    let sponsorData = JSON.parse(fs.readFileSync(sponsorDataFile, "utf8"));

    // Cek apakah sponsor sudah ada
    const existingSponsor = sponsorData.find((s) => s.sponsorName === sponsorName);
    if (existingSponsor) {
      return res.status(400).json({ message: "❌ Sponsor sudah ada." });
    }

    // Simpan sponsor baru
    const newSponsor = { sponsorName, sponsorImage, sponsorUrl };
    sponsorData.push(newSponsor);
    fs.writeFileSync(sponsorDataFile, JSON.stringify(sponsorData, null, 2));

    console.log("✅ Sponsor berhasil ditambahkan:", newSponsor);
    res.json({
      message: `✅ Sponsor ${sponsorName} berhasil ditambahkan.`,
      sponsor: newSponsor,
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// Tambahkan router ke aplikasi Express
app.use(express.json());
app.use(router);

// Jalankan server
app.listen(port, () => {
  console.log(`===============[SERVER IS RUNNING NOW]===============`);
  console.log(`❍ Port: ${port}`);
  console.log(`====================================================`);
});
