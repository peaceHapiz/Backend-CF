const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const prisma = require("../../model/model");

router.get("/all-request", async (req, res) => {
  try {
    const basePath = path.join(__dirname, "../../../file/verifikasi_dokumen");

    if (!fs.existsSync(basePath)) {
      return res.json({ data: [], message: "Belum ada file" });
    }

    const result = [];
    const folders = fs.readdirSync(basePath);

    for (const folder of folders) {
      const folderPath = path.join(basePath, folder);
      if (!fs.statSync(folderPath).isDirectory()) continue;

      const files = fs.readdirSync(folderPath);

      const processedFiles = await Promise.all(files.map(async (file) => {
        const fullPath = path.join(folderPath, file);
        if (!fs.statSync(fullPath).isFile()) return null;

    
        const match = file.match(/([a-zA-Z0-9._%+-]+)_gmail_com/i);
        const email = match ? match[1].replace(/_/g, "@") + "@gmail.com" : null;

        if (!email) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { add_verified: true },
        });

        return {
          userId: folder,
          email,
          path: fullPath,
          status: Boolean(user?.add_verified),
        };
      }));

      result.push(...processedFiles.filter(Boolean));
    }

    return res.json({ data: result });
  } catch (error) {
    console.error("Error reading files:", error);
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
});

module.exports = router;
