const express = require("express");
const router = express.Router();
const path = require("path");

router.get('/file/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, "../../../file/verifikasi_dokumen", folder, filename);
  
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('File not found or error:', err);
        res.status(404).send('File not found');
      }
    });
  });
  
module.exports = router;