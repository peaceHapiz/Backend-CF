const express = require('express');
const prisma = require('../../model/model');
const { Role } = require('@prisma/client');
const router = express.Router();

router.post('/get-ticket', async (req, res) => {
    const { role } = req.body;
    console.log(role)

    const validRoles = ["admin",
        "guru",
        "pelajar",
        "mahasiswa",
        "keluarga_siswa",
        "alumni"];

    if (!role || !validRoles.includes(role)) {
        return res.status(400).json({
            code: 400,
            message: "Role tidak valid. Harus salah satu dari: siswa, guru, umum"
        });
    }

    

    if(role == "mahasiswa" || role == "pelajar") {

        var userRole = "Eksternal";
    }else if(role == "alumni"){
        var userRole = "Alumni";
    }else if(role == "keluarga_siswa"){
        var userRole = "Keluarga_Siswa";
    }else{
        var userRole = "Internal";
    }


    try {
        const checkRole = await prisma.ticketOffline.findFirst({
            where: { ticket_type : userRole}
        });

        if (!checkRole) {
            return res.status(400).json({
                code: 400,
                message: "Tidak ada tiket untuk role tersebut"
            });
        }

        const getTiket = await prisma.ticketOffline.findMany({
            where: {
                AND: [
                    { ticket_type: userRole },
                    { isReady: true }
                ]
            }
        });

        return res.status(200).json({
            code: 200,
            message: "Tiket ditemukan",
            data: getTiket
        });
    } catch (error) {
        console.error("Error saat mengambil tiket:", error.message);

        return res.status(500).json({
            code: 500,
            message: "Internal server error"
        });
    }
});

module.exports = router;
