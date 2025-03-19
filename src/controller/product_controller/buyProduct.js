const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");

const { v4: uuidv4 } = require("uuid");
const prisma = require("../../model/model");

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: false, // Ubah ke true jika production
  serverKey: "SB-Mid-server-5ycn5sOjLN4v2SiNt0BCipcg",
});

router.post("/buy-product", async (req, res) => {
  try {
    const { userId, products } = req.body;

    // Validasi input
    if (!userId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Data tidak valid!" });
    }

    // Cek apakah produk tersedia
    let totalAmount = 0;
    const productDetails = [];

    for (const item of products) {
      const productId = parseInt(item.productId, 10);
      const quantity = parseInt(item.qty, 10);

      const product = await prisma.shop.findUnique({ where: { id: productId } });

      if (!product) {
        return res.status(400).json({ message: `Produk dengan ID ${productId} tidak ditemukan` });
      }

      totalAmount += product.price * quantity;

      productDetails.push({
        productId: product.id,
        alias: product.alias,
        name: product.name,
        description: product.description,
        picture: product.picture,
        price: product.price,
        unitSymbol: "Rp",
        qty: quantity,
      });
    }

    // Simpan transaksi ke database
    const transaction = await prisma.productTransaction.create({
      data: {
        userId,
        paymentStatus: "pending",
      },
    });

    // Simpan data pembayaran
    const payment = await prisma.productPayment.create({
      data: {
        orderId: `ORDER-${Date.now()}`,
        method: "Midtrans",
        status: "pending",
        amount: totalAmount,
        unit: "IDR",
        transaction: { connect: { id: transaction.id } },
      },
    });

    // Update transaksi dengan paymentId
    await prisma.productTransaction.update({
      where: { id: transaction.id },
      data: { paymentId: payment.id },
    });

    // Simpan detail produk yang dibeli
    for (const product of productDetails) {
      await prisma.productDetail.create({
        data: {
          transactionId: transaction.id,
          productId: product.productId,
          alias: product.alias,
          name: product.name,
          description: product.description,
          picture: product.picture,
          price: product.price,
          unitSymbol: product.unitSymbol,
          qty: product.qty,
        },
      });
    }

    // Buat transaksi di Midtrans
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

    res.json({
      message: "Produk berhasil dipesan, lanjutkan pembayaran",
      transaction,
      payment,
      midtransRedirectUrl: midtransResponse.redirect_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan dalam pembelian produk" });
  }
});

module.exports = router;
