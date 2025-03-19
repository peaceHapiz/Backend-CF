const express = require('express')
const router = express.Router()

router.post("/validation/verifyotp", async (req, res) => {
    const { users, otp } = req.body;
  
    if (!users || !otp) {
      return res.status(400).json({ code: 400, message: "Data tidak valid" });
    }
  
    let method;
    if (users.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
      method = "email";
    } else if (users.match(/^[0-9]+$/) && users.length > 9) {
      method = "phone";
    } else {
      return res.status(400).json({ code: 400, message: "Data tidak valid" });
    }
  
    try {
      // Cari user berdasarkan email atau phone
      const user = await prisma.user.findFirst({
        where: method === "email" ? { email: users } : { phone: users },
      });
  
      if (!user) {
        return res.status(404).json({ code: 404, message: "User tidak ditemukan" });
      }
  
      // Cari OTP yang masih aktif
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          userId: user.id,
          code: otp,
          method: method,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
      });
  
      if (!otpRecord) {
        return res.status(400).json({ code: 400, message: "OTP tidak valid atau sudah expired" });
      }
  
      // Tandai OTP sebagai sudah digunakan
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
  
      res.status(200).json({
        code: 200,
        message: "OTP berhasil diverifikasi",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: "Terjadi kesalahan server" });
    }
  });

  module.exports =  router