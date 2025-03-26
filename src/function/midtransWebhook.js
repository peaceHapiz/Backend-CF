const express = require("express");
const router = express.Router();
const prisma = require("../model/model");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const configPath = path.join(__dirname, '../../db/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const MIDTRANS_SERVER_KEY = "SB-Mid-server-5ycn5sOjLN4v2SiNt0BCipcg";
const midtransAuth = {
  headers: {
    Authorization:
      "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
  },
};




const {generateInvoice} = require('../controller/tiket_controller/invoice-controller.js')






async function midtransWebHook() {
  try {
    console.log("Memulai pengecekan transaksi pending...");
    
    const pendingTransactions = await prisma.ticketTransaction.findMany({
      where: { paymentStatus: "pending", checked: false },
      include: { payment: true, user: true, tickets: true, ticketOffline: true },
    });
    
    if (pendingTransactions.length === 0) {
      console.log("✅ Tidak ada transaksi pending.");
      return { message: "Tidak ada transaksi pending" };
    }

    let updatedTransactions = [];

    
    for (const transaction of pendingTransactions) {
      const orderId = transaction.payment?.orderId;
      if (!orderId) continue;


      const userTicketCount = await prisma.ticket.count({
        where: { userId: transaction.user.id },
      });

      if (userTicketCount >= 1) {
        await prisma.ticketTransaction.update({
          where: { id: transaction.id },
          data: { checked: true },
        });
        console.log(`🚫 User ${transaction.user.id} sudah memiliki 1 tiket. Melewati transaksi.`);
        continue;
      }
      
      const response = await axios.get(
        `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
        midtransAuth
      );
      
      const { transaction_status } = response.data;
      let statusUpdate = {};
      
      if (transaction_status === "settlement" || transaction_status === "capture") {
        statusUpdate = { paymentStatus: "successful", checked: true };
        
        await prisma.payment.update({
          where: { id: transaction.payment.id },
          data: { status: "successful" },
        });


        
        await generateQR(transaction);
        await generateEticket(transaction);
        await sendEmail(transaction);

        await prisma.ticketTransaction.update({
          where: { id: transaction.id },
          data: { checked: true,
            paymentStatus: "successful",
           },
        });

        updatedTransactions.push({ orderId, status: "successful" });
        console.log(`✅ Transaksi ${orderId} berhasil, QR & e-Ticket dibuat.`);
      } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
        statusUpdate = { paymentStatus: "failed", checked: true };
        
        await prisma.payment.update({
          where: { id: transaction.payment.id },
          data: { status: "failed" },
        });

        updatedTransactions.push({ orderId, status: "failed" });
        console.log(`❌ Transaksi ${orderId} gagal atau kadaluarsa.`);
      }
      
      if (Object.keys(statusUpdate).length > 0) {
        await prisma.ticketTransaction.update({
          where: { id: transaction.id },
          data: statusUpdate,
        });
      }
    }
    
    return { message: "Pengecekan transaksi selesai", updatedTransactions };
  } catch (error) {
    console.error("❌ Error dalam pengecekan Midtrans:", error);
    return { message: "Terjadi kesalahan" };
  }
}


async function generateQR(transaction) {
  const user = transaction.user;
  const quantity = transaction.tickets.length || 1;
  const productId = transaction.ticketOffline?.productId;
  
  if (!productId) {
    console.error("❌ Product ID tidak ditemukan dalam ticketOffline.");
    return;
  }
  
  const uploadDir = path.join(__dirname, "../../file/qrcode");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let attachments = [];
  let inlineImages = [];
  
  for (let i = 0; i < quantity; i++) {
    const countTickets = await prisma.ticket.count({
      where: {
        userId : user.id
      }
    })

    const uniqueCode = Math.floor(10000 + Math.random() * 90000);
    const urlTicket = `T-${transaction.user.id}-${uniqueCode}`;
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
    
  } else {
    console.error("❌ Email gagal dikirim, tiket tidak akan dibuat.");
  }
}

async function sendEmail(to, attachments, inlineImages, orderId) {
  // const transporter = nodemailer.createTransport({
  //     host: config.EmailOTP.ProductionEmail.service,
  //     port: config.EmailOTP.ProductionEmail.port,
  //     secure: config.EmailOTP.ProductionEmail.secure,
  //     auth: {
  //       user: config.EmailOTP.ProductionEmail.user,
  //       pass: config.EmailOTP.ProductionEmail.pass,
  //     },
  //     debug: true,
  //   });
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

async function generateEticket(transaction) {
  const user = transaction.user;
  const quantity = transaction.tickets.length || 1;
  const productId = transaction.ticketOffline?.productId;
  const ticketId = transaction.id; // Asumsi: ticketId = barcode

  try {
    if (!productId) {
      console.error("❌ Product ID tidak ditemukan dalam ticketOffline.");
      return;
    }

    const uploadDir = path.join(__dirname, "../../file/eTicket");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const qrPath = path.join(__dirname, `../../file/qrcode/${ticketId}.png`);
    const pdfPath = path.join(uploadDir, `${ticketId}.pdf`); // Nama PDF sama dengan barcode

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(20)
      .text("Chemicfest #9 - E-Ticket", { align: "center", underline: true })
      .moveDown(2);

    // Informasi Acara
    doc.fontSize(14).text("Informasi Acara:", { bold: true }).moveDown(1);
    doc.text("Nama Event: Chemicfest #9");
    doc.text("Penyelenggara: OSIS SMK SMTI Yogyakarta");
    doc.text("Tanggal: 17 Mei 2025");
    doc.text(
      "Lokasi: GOR UMY, Jl. Brawijaya, Ngebel, Tamantirto, Kasihan, Bantul, Yogyakarta"
    );
    doc.moveDown(2);

    // Informasi Pemesan
    doc.fontSize(14).text("Informasi Pemesan:", { bold: true }).moveDown(1);
    doc.text(`Kode Pesanan: ${ticketId}`);
    doc.text(`Nama Pemesan: ${user.email}`);
    doc.text(`Jumlah Tiket: ${quantity} Pax`);
    doc.text("Validitas: 17 Mei 2025");
    doc.moveDown(2);

    // Harga
    doc.fontSize(14).text("Total Harga: IDR 40.000", { bold: true });
    doc.moveDown(2);

    // Tambah QR Code
    if (fs.existsSync(qrPath)) {
      doc.image(qrPath, {
        fit: [150, 150],
        align: "center",
      });
    }

    doc.text("Dibuat pada 17 Agustus 1945", { align: "center" });
    doc.moveDown(2);

    // Syarat & Ketentuan
    doc.fontSize(14).text("Syarat & Ketentuan:", { bold: true }).moveDown(1);
    doc.text("- Maks. pembelian 2 tiket per akun/ID per show day.");
    doc.text("- Wajib login ke akun chemicfest9.site untuk melakukan pembelian.");

    doc.end();

    console.log("✅ Email berhasil dikirim ke:", user.email);

    await generateInvoice(transaction);

    return new Promise((resolve) => {
      stream.on("finish", () => {
        console.log("✅ PDF selesai dibuat:", pdfPath);
        resolve(true); // Mengembalikan `true` setelah PDF selesai dibuat
      });
    });
  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    return false; // ❌ Gagal, tiket tidak dibuat
  }
}

module.exports = midtransWebHook;
