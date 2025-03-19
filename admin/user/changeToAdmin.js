const express = require('express')
const router = express.Router()
const fs = require('fs')
const prisma = require('../../src/model/model')


router.post('/changerole', async (req,res) => {
    const {admin, users} = req.body

    try {
        const filePath = './db/admin.json';

        let dataAdmin = fs.readFileSync(filePath)
        dataAdmin = JSON.parse(dataAdmin)

        if (!dataAdmin || !Array.isArray(dataAdmin)) {
            dataAdmin = [];
          }

        let isAdmin = dataAdmin.find((admins) => admins.username == admin)

        if (!isAdmin) {
            throw new Error("❌ Hanya admin yang bisa mengubah role user.");
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ id: users }, { username: users }],
                role: { not: "admin" } // Pastikan user belum admin
            }
        });


        if (!user) {
            throw new Error("❌ User tidak ditemukan atau sudah admin.");
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id }, // Gunakan UUID sebagai patokan
            data: { role: "admin" }
        });

        console.log(`✅ ${updatedUser.username} sekarang menjadi admin.`);

        const adminData = {
            id: updatedUser.id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            password: updatedUser.password, 
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            verified: updatedUser.verified
        };

        dataAdmin.push(adminData); // Tambahkan admin baru

        // Simpan perubahan ke file JSON
        fs.writeFileSync(filePath, JSON.stringify(dataAdmin, null, 2));
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
})

module.exports = router