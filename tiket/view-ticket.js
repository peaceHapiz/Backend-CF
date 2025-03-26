const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const pdfDirectory = path.join(__dirname, '../file/eticket'); // Folder penyimpanan PDF

router.get('/:ticketUrl', async (req, res) => {
    try {
        const { ticketUrl } = req.params;

        // Gunakan ticketUrl sebagai nama file PDF
        const pdfFileName = `${ticketUrl}.png`;
        const pdfPath = path.join(pdfDirectory, pdfFileName);

        // Periksa apakah file PDF ada
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ code: 404, message: "PDF file not found" });
        }

        // Kirim file PDF ke browser
        res.sendFile(pdfPath);

    } catch (error) {
        console.error("Error fetching PDF:", error.message);
        res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
});

module.exports = router;
