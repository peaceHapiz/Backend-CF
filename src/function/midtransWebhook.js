const express = require("express");
const router = express.Router();
const prisma = require("../model/model");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nodemailer = require('nodemailer');

const MIDTRANS_SERVER_KEY = "SB-Mid-server-61wOUe6J09Z4E1Ox6ia72YBR";
const midtransAuth = {
  headers: {
    Authorization:
      "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
  },
};




const {generateInvoice} = require('../controller/tiket_controller/invoice-controller.js')






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
  
  const uploadDir = path.join(__dirname, "../../file/eTicket");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let attachments = [];
  let inlineImages = [];
  
  for (let i = 0; i < quantity; i++) {
    const uniqueCode = Math.floor(10000 + Math.random() * 90000);
    const urlTicket = `T-${Date.now()}-${uuidv4().slice(0, 5)}-${uniqueCode}`;
    const qrFilePath = path.join(uploadDir, `${urlTicket}.png`);
    const qrUrl = `https://etiket.chemicfest9.site/qrcode/${urlTicket}.png`;
    
    await QRCode.toFile(qrFilePath, urlTicket);

    const cid = `qrcode${i}@chemicfest`;
    attachments.push({
      filename: `${urlTicket}.png`,
      path: qrFilePath,
      cid: cid,
    });
    inlineImages.push(`<img src="cid:${cid}" alt="QR Code" />`);
  }

  // ✅ Coba kirim email dulu sebelum menyimpan tiket ke database
  const emailSent = await sendEmail(user.email, attachments, inlineImages, transaction.payment.orderId);
  
  if (emailSent) {
    for (let i = 0; i < quantity; i++) {
      const uniqueCode = Math.floor(10000 + Math.random() * 90000);
      const urlTicket = `T-${Date.now()}-${uuidv4().slice(0, 5)}-${uniqueCode}`;
      const qrUrl = `https://etiket.chemicfest9.site/qrcode/${urlTicket}.png`;

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
          qrcode: qrUrl, 
          eTicket: `https://etiket.chemicfest9.site/${urlTicket}`,
          downloadETicket: `https://etiket.chemicfest9.site/download/${urlTicket}`,
          invoice: `https://invoice.chemicfest9.site/${transaction.payment.orderId}`,
          downloadInvoice: `https://invoice.chemicfest9.site/download/${transaction.payment.orderId}`,
        },
      });

    }
    await generateInvoice(transaction);
  } else {
    console.error("❌ Email gagal dikirim, tiket tidak akan dibuat.");
  }
}

async function sendEmail(to, attachments, inlineImages, orderId) {
  let transporter = nodemailer.createTransport({
    host: "mx5.mailspace.id",
    port: 465,
    secure: true,
    auth: {
      user: "noreply@lockify.space",
      pass: "@Sandiku197",
    },
  });

  const mailOptions = {
    from: '"Chemicfest" <noreply@lockify.space>',
    to: to,
    subject: "E-Ticket Chemicfest Anda",
    html: `
      <h2>Terima kasih telah membeli tiket Chemicfest!</h2>
      <p>Berikut adalah tiket Anda:</p>
      ${inlineImages.join("<br>")}
      <p>Anda juga dapat mengunduh invoice di sini: 
        <a href="https://invoice.chemicfest.site/download/${orderId}">Download Invoice</a>
      </p>
    `,
    attachments: attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email berhasil dikirim ke:", to);
    return true;  // ✅ Berhasil, lanjut buat tiket
  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    return false; // ❌ Gagal, tiket tidak dibuat
  }
}

module.exports = midtransWebHook;
