const express = require('express');
const router = express.Router();
const prisma = require('../src/model/model')
const check = require('../file/invoice')
const fs = require('fs')

router.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = `../file/invoice/${filename}`;
  
    if (fs.existsSync(filePath)) {
        console.log(`file exists: ${filename}`);
        res.download(filePath, filename);
    } else {
        res.status(404).json({ message: "File tidak ditemukan" });
    }
})

module.exports = router