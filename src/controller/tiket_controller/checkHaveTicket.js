const express = require('express');
const router = express.Router();
const prisma  = require('../../model/model');

router.post('/have-ticket', async (req, res) => {
  const { userId } = req.body;

  try {
    // ambil data tiket
    const ticketTransactions = await prisma.ticketTransaction.findMany({
      where: {
        userId: userId,
        paymentStatus: "successful"
      },
      include: {
        ticketOffline: true,
        tickets: {
          include: {
            urlTicket: true 
          }
        }
      }
    });

    
    if (!ticketTransactions || ticketTransactions.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "Pengguna belum memiliki tiket yang berhasil"
      });
    }

    // ambil data tiket yang dimiliki
    const transactionsData = ticketTransactions.map(transaction => ({
      transactionId: transaction.id,
      ticketOffline: transaction.ticketOffline, 
      tickets: transaction.tickets, 
      ticketUrls: transaction.tickets
        .map(ticket => ticket.urlTicket?.eTicket) 
        .filter(url => url) 
    }));

    return res.status(200).json({
      code: 200,
      message: "Pengguna memiliki tiket yang berhasil",
      data: transactionsData
    });

  } catch (error) {
    console.error("Error checking user ticket:", error);
    return res.status(500).json({
      code: 500,
      message: "Terjadi kesalahan pada server"
    });
  }
});

module.exports = router;
