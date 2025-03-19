const express = require('express')
const router = express.Router()
const prisma  = require('../../model/model')

router.post('/ticket/checkhave', async(req,res) => {
  const {userId} = req.body

  try {
    // Cari transaksi tiket berdasarkan userId
    const ticketTransaction = await prisma.ticketTransaction.findFirst({
      where: {
        userId: userId,
        payment : {
          status : "succesful"
        }
        
      },
      include: {
        tickets: true // Mengambil data tiket dalam transaksi
      }
    });

    // Jika transaksi ditemukan dan memiliki tiket, kembalikan true
    if(ticketTransaction.lenght > 0){
      return res.status(200).json({code : 200, data : ticketTransaction})
    }

    // Jika tidak ada transaksi ata       u tiket kosong, kembalikan false
    return res.status(404).json({code : 404, message : "Pengguna belum memiliki ticket yang berhasil"})
  } catch (error) {
    console.error("Error checking user ticket:", error);
    return false;
  }
})




module.exports = router