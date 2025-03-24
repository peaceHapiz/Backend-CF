const prisma  = require('../model/model')

async function forgotPassword() {
    try {
        const now = new Date();
        const expiredForgotCode = await prisma.forgot.findMany({
            where: {
                expiredTime: { lt: now }, 
        }
    })

    if (expiredForgotCode.length === 0) {
        console.log("✅ Tidak ada OTP Forgot Password yang expired.");
        return;
    }

    const deleted = await prisma.forgot.deleteMany({
        where: {
            expiredTime: { lt: now },
        },
    });

    // console.log(`🗑️ ${deleted.count} OTP yang expired berhasil dihapus.`);
    } catch (error) {
        console.error('Error saat menghapus OTP Forgot Password:', error);
    }
}

module.exports = forgotPassword