const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../../model/model");

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: false, 
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

router.post("/buy-ticket", async (req, res) => {
  try {
    const { userId, product_Id, quantity } = req.body;
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    const checkReady = await prisma.ticketOffline.findFirst({
      where: {
        productId: parseInt(product_Id, 10),
      }, 
      select: {
        isReady: true,
      },
    })

    if(!checkReady.isReady){
      return res.status(400).json({ message: "Tiket belum siap" });
    }
    
    if (!user) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }


    if (quantity < 1 || quantity > 2) {
      return res.status(400).json({ message: "Maksimal pembelian tiket adalah 1" });
    }


    const userTicketsCount = await prisma.ticket.count({ where: { userId } });



if (userTicketsCount > 0) {
  return res.status(400).json({ message: "Anda sudah memiliki tiket, tidak bisa membeli lagi" });
}

if (quantity > 1) {
  return res.status(400).json({ message: "Maksimal pembelian tiket adalah 1" });
}

    const productId = parseInt(product_Id, 10);


    const ticketOffline = await prisma.ticketOffline.findUnique({
      where: { productId },
    });

    if (!ticketOffline || !ticketOffline.isReady) {
      return res.status(400).json({ message: "Tiket tidak tersedia" });
    }

    // Hitung total harga
    const totalAmount = ticketOffline.price * quantity;
    

    const transaction = await prisma.ticketTransaction.create({
      data: {
        userId,
        paymentStatus: "pending",
        productId: productId,
        ticketOfflineId: ticketOffline.id,
      },
    });

    // Simpan data pembayaran
    const payment = await prisma.payment.create({
      data: {
        orderId: `ORDER-${Date.now()}`,
        method: "Midtrans",
        status: "pending",
        amount: totalAmount,
        unit: ticketOffline.unit,
        transaction: { connect: { id: transaction.id } },
      },
    });


    await prisma.ticketTransaction.update({
      where: { id: transaction.id },
      data: { paymentId: payment.id },
    });

    const parameter = {
      transaction_details: {
        order_id: payment.orderId,
        gross_amount: totalAmount,
      },
      customer_details: {
        user_id: userId,
      },
    };

    const midtransResponse = await snap.createTransaction(parameter);
    const token = await snap.createTransactionToken(parameter)

    res.json({
      message: "Tiket berhasil dipesan, lanjutkan pembayaran",
      transaction,
      payment,
      midtransRedirectUrl: midtransResponse.redirect_url,
      token : token 
    });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan dalam pembelian tiket" });
  }
});

module.exports = router;
