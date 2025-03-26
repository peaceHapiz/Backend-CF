const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/download/:filename", (req, res) => {
    let filename = req.params.filename;

    // Pastikan filename memiliki ekstensi .png
    if (!filename.endsWith(".png")) {
        filename += ".png";
    }

  
    const filePath = path.resolve(__dirname, "../file/eticket", filename);

    console.log("Full file path:", filePath); 

    if (fs.existsSync(filePath)) {
        console.log(`File exists: ${filename}`);
        res.download(filePath, filename);
    } else {
        console.log("File not found:", filePath);
        res.status(404).json({ message: "File tidak ditemukan" });
    }
});

module.exports = router;
