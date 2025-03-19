const prisma = require('../model/model')
async function otpWatcher() {
    try {
      const now = new Date();
  
      // 🔹 Cari OTP yang sudah expired
      const expiredOTPs = await prisma.oTP.findMany({
        where: {
          expiresAt: { lt: now }, // lt = less than (kurang dari waktu sekarang)
        },
      });
  
      if (expiredOTPs.length === 0) {
        console.log("✅ Tidak ada OTP yang expired.");
        return;
      }
  
      // 🔹 Hapus semua OTP yang expired
      const deleted = await prisma.oTP.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });
  
      console.log(`🗑️ ${deleted.count} OTP yang expired berhasil dihapus.`);
    } catch (error) {
      console.error("❌ Error saat menghapus OTP expired:", error);
    }
  }

  module.exports = otpWatcher()