const prisma  = require('../model/model')

async function forgotPasswordWatcher() {
    try {
        const now = new Date();
        const expiredForgotCode = await prisma.forgot.findMany({
            where: {
                expiresAt: { lt: now }, 
        }
    })

    if (expiredForgotCode.length === 0) {
        console.log("✅ Tidak ada OTP yang expired.");
        return;
    }

    const deleted = await prisma.forgot.deleteMany({
        where: {
            expiresAt: { lt: now },
        },
    });

    console.log(`🗑️ ${deleted.count} OTP yang expired berhasil dihapus.`);
    } catch (error) {
        console.error('Error saat menghapus OTP Forgot Password:', error);
    }
}

module.exports = forgotPasswordWatcher()