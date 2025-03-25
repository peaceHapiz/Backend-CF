const express = require('express')
const app = express()
const router = express.Router()
const prisma  = require('../../model/model')

router.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../../file/qrcode", filename);
  
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: "File tidak ditemukan" });
    }
  });
  
  module.exports = router;