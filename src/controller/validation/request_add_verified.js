const express = require("express");
const router = express.Router();
const prisma = require("../../model/model");
const fs = require("fs");
const path = require("path");

router.get("/add-verified", async (req, res) => {
  try {
    const basePath = path.join(__dirname, "..", "..",  "..", "file", "verifikasi_dokumen");

    // Pastikan direktori utama ada
    if (!fs.existsSync(basePath)) {
      return res.json({ data: [], message: "Belum ada dokumen terkirim" });
    }

    // Ambil semua folder user (hanya angka, ID peserta)
    const userFolders = fs.readdirSync(basePath).filter(folder => {
      const fullPath = path.join(basePath, folder);
      return fs.statSync(fullPath).isDirectory() && /^\d+$/.test(folder);
    });

    const result = [];

    for (const folder of userFolders) {
      const userId = folder.toString();
      if (isNaN(userId)) continue;

      // Cari data user
      const user = await prisma.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          verified: true
        }
      });

      if (!user) continue;

      const filePath = path.join(basePath, folder);
      const files = fs.readdirSync(filePath)
        .filter(file => fs.statSync(path.join(filePath, file)).isFile())
        .map(file => ({
          name: file,
          url: `/file/verifikasi_dokumen/${folder}/${file}`
        }));

      if (files.length === 0) continue;

      result.push({
        user,
        files
      });
    }

    res.json({ data: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error", detail: error.message });
  }
});

module.exports = router;
