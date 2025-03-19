const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.delete('/delete-sponsor', async (req,res) =>{
    const {id} = req.body

    try {
        const filePath = path.join('./db/sponsor.json');        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sponsors = JSON.parse(fileContent);

        const sponsorIndex = sponsors.findIndex((s) => s.id == id);
        if (sponsorIndex === -1) {
            return res.status(404).json({ message: "❌ Sponsor tidak ditemukan!" });
        }

        const deletedSponsor = sponsors.splice(sponsorIndex, 1)[0];
        if (deletedSponsor.sponsorImage && deletedSponsor.sponsorImage !== "default-image.png") {
            const imagePath = path.join("./file/sponsor", deletedSponsor.sponsorImage);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }


        fs.writeFileSync(filePath, JSON.stringify(sponsors, null, 2));

        res.json({
            message: `✅ Sponsor dengan ID ${id} berhasil dihapus.`,
            sponsor: deletedSponsor,
        });
    } catch (error) {
        res.status(500).json({ message: "❌ Terjadi kesalahan pada server.", error: error.message });
    }
})

module.exports = router