const express = require("express");
const router = express.Router();
const prisma = require("../../model/model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Storage config (dynamic filename & path)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userId = req.body.userId;
    const dir = path.join(__dirname, "../../../file/verifikasi_dokumen", userId.toString());

    // Create dir if not exists
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: async (req, file, cb) => {
    const userId = req.body.userId;

    // Ambil email dari database
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
    });

    if (!user) return cb(new Error("User not found"));

    const email = user.email.replace(/[^a-zA-Z0-9]/g, "_"); // amanin karakter
    const dir = path.join(__dirname, "../../../file/verifikasi_dokumen", userId.toString());

    // Hitung jumlah file yang sudah ada
    const files = fs.readdirSync(dir).filter(f => f.startsWith(`${userId}-${email}`));
    const nextNumber = files.length + 1;

    const ext = path.extname(file.originalname);
    const filename = `${userId}-${email}-${nextNumber}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

router.post("/send-dokumen", upload.single("dokumen"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    res.json({
      message: "File uploaded successfully",
      filename: file.filename,
      path: file.path
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
