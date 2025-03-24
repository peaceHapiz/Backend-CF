const express = require("express");
const router = express.Router();
const prisma = require("../model/model");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const MIDTRANS_SERVER_KEY = "SB-Mid-server-61wOUe6J09Z4E1Ox6ia72YBR";
const midtransAuth = {
  headers: {
    Authorization:
      "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
  },
};

async function midtransWebHook() {
  try {
    // console.log("Memulai pengecekan transaksi pending...");

    const pendingTransactions = await prisma.ticketTransaction.findMany({
      where: { paymentStatus: "pending" },
      include: { payment: true, user: true, tickets: true, ticketOffline: true },
    });

    if (pendingTransactions.length === 0) {
       console.log("✅ Tidak ada transaksi pending.");
      return { message: "Tidak ada transaksi pending" };
    }

    let updatedTransactions = [];
    const requests = pendingTransactions.map(async (transaction) => {
      const orderId = transaction.payment?.orderId;
      if (!orderId) return;

      const response = await axios.get(
        `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
        midtransAuth
      );

      const { transaction_status } = response.data;
      let statusUpdate = {};

      if (transaction_status === "settlement" || transaction_status === "capture") {
        statusUpdate = { paymentStatus: "successful" };

        await prisma.payment.update({
          where: { id: transaction.payment.id },
          data: { status: "successful" },
        });

        await generateTickets(transaction);
        updatedTransactions.push({ orderId, status: "successful" });
      } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
        statusUpdate = { paymentStatus: "failed" };

        await prisma.payment.update({
          where: { id: transaction.payment.id },
          data: { status: "failed" },
        });

        updatedTransactions.push({ orderId, status: "failed" });
      }

      if (Object.keys(statusUpdate).length > 0) {
        await prisma.ticketTransaction.update({
          where: { id: transaction.id },
          data: statusUpdate,
        });
      }
    });

    await Promise.all(requests);
     console.log(`${updatedTransactions.length} transaksi berhasil diperbarui.`);
    return { message: "Cek transaksi selesai", updatedTransactions };
  } catch (error) {
    console.error("❌ Error cek transaksi:", error);
    return { message: "Terjadi kesalahan", error };
  }
}

async function generateTickets(transaction) {
  const user = transaction.user;
  const quantity = transaction.tickets.length || 1;
  const productId = transaction.ticketOffline?.productId;

  if (!productId) {
    console.error("❌ Product ID tidak ditemukan dalam ticketOffline.");
    return;
  }

  for (let i = 0; i < quantity; i++) {
    const uniqueCode = Math.floor(10000 + Math.random() * 90000);
    const urlTicket = `T-${Date.now()}-${uuidv4().slice(0, 5)}-${uniqueCode}`;
    const qrCode = await QRCode.toDataURL(urlTicket);

    const ticket = await prisma.ticket.create({
      data: {
        transactionId: transaction.id,
        userId: user.id,
        productId: productId,
        bookingCode: uuidv4().slice(0, 8),
        passCode: uniqueCode.toString(),
        venue: "Online",
        needed: 1,
        type: "Tiket Chemicfest",
      },
    });

    await prisma.urlTicket.create({
      data: {
        ticketId: ticket.id,
        barcode: urlTicket,
        qrcode: qrCode,
        eTicket: `https://eticket.chemicfest.site/${urlTicket}`,
        downloadETicket: `https://eticket.chemicfest.site/download/${urlTicket}`,
        invoice: `https://invoice.chemicfest.site/${transaction.payment.orderId}`,
        downloadInvoice: `https://invoice.chemicfest.site/download/${transaction.payment.orderId}`,
      },
    });

    const uploadDir = path.join(__dirname, "../../file/qrcode");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    await QRCode.toFile(path.join(uploadDir, `${urlTicket}.png`), urlTicket);
  }
}

module.exports = midtransWebHook;
