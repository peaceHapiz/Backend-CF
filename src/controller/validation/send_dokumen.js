const express = require("express");
const router = express.Router();
const prisma = require("../../model/model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Simpan sementara dulu di folder `temp`
const upload = multer({ dest: "temp/" });

router.post("/send-dokumen", upload.single("dokumen"), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });


    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const email = user.email.replace(/[^a-zA-Z0-9]/g, "_");

    const userDir = path.join(__dirname, "../../../file/verifikasi_dokumen", userId.toString());
    fs.mkdirSync(userDir, { recursive: true });

    const existingFiles = fs.readdirSync(userDir).filter(f => f.startsWith(`${userId}-${email}`));
    const nextNumber = existingFiles.length + 1;

    const ext = path.extname(file.originalname);
    const newFilename = `${email}-${nextNumber}${ext}`;
    const newPath = path.join(userDir, newFilename);


    fs.renameSync(file.path, newPath);

    res.json({
      message: "File uploaded successfully",
      filename: newFilename,
      path: newPath
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


module.exports = router;