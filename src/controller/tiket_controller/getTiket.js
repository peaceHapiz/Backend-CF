const express = require('express');
const prisma = require('../../model/model');

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
            message: "Role tidak valid."
        });
    }

    

    if(role == "mahasiswa" || role == "pelajar") {

        var userRole = "eksternal";
    }else if(role == "alumni"){
        var userRole = "alumni";
    }else if(role == "keluarga_siswa"){
        var userRole = "keluarga_Siswa";
    }else if(role == "guru"){
        var userRole = "guru";
    }else{
        var userRole = "internal";
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
