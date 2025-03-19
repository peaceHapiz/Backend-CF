const prisma = require('../model/model')
async function sessionWatcher() {
    try {
      const now = new Date();
  
      // 🔹 Cari sesi yang sudah expired
      const expiredSessions = await prisma.session.findMany({
        where: {
          expiresAt: { lt: now }, // lt = less than (kurang dari waktu sekarang)
        },
      });
  
      if (expiredSessions.length === 0) {
        console.log("✅ Tidak ada sesi yang expired.");
        return;
      }
  
      // 🔹 Hapus semua sesi yang expired
      const deleted = await prisma.session.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });
  
      console.log(`🗑️ ${deleted.count} sesi yang expired berhasil dihapus.`);
    } catch (error) {
      console.error("❌ Error saat menghapus sesi expired:", error);
    }
  }

  module.exports = sessionWatcher()