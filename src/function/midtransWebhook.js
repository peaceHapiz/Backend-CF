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

const MSK = `SB-Mid-server-5ycn5sOjLN4v2SiNt0BCipcg`;
const midtransAuth = {
  headers: {
    Authorization:
      "Basic " + Buffer.from(MSK + ":").toString("base64"),
  },
};




const {generateInvoice} = require('../controller/tiket_controller/invoice-controller.js');
const barcode = require("barcode");






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
        const uniqueCode = Math.floor(10000 + Math.random() * 90000);
        const urlTicket = `T-${transaction.user.id}-${uniqueCode}`;
        console.log(`urlTicket: ${urlTicket}`);
        const order_id = transaction.payment.orderId;
        const amount = transaction.payment.amount;

        
        await generateQR(transaction, urlTicket);
        await prisma.ticketTransaction.update({
          where: { id: transaction.id },
          data: { checked: true,
            paymentStatus: "successful",
           },
        });
        await generateEticket(transaction, urlTicket, order_id, amount);
        await sendEmail(transaction);


        updatedTransactions.push({ orderId, status: "successful" });
        console.log(`✅ Transaksi ${orderId} berhasil, QR & e-Ticket dibuat.`);
      } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
        statusUpdate = { paymentStatus: "failed", checked: true };
        
        await prisma.payment.update({
          where: { id: transaction.payment.id },
          data: { status: "failed" },A
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


async function generateQR(transaction, urlTicket) {
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

  
  const emailSent = await sendEmail(user.email, attachments, inlineImages, transaction.payment.orderId);
  
  if (emailSent) {
    for (let i = 0; i < quantity; i++) {
      const uniqueCode = Math.floor(10000 + Math.random() * 90000);
      
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
  const transporter = nodemailer.createTransport({
      host: config.EmailOTP.ProductionEmail.service,
      port: config.EmailOTP.ProductionEmail.port,
      secure: config.EmailOTP.ProductionEmail.secure,
      auth: {
        user: config.EmailOTP.ProductionEmail.user,
        pass: config.EmailOTP.ProductionEmail.pass,
      },
      debug: true,
    });
  // let transporter = nodemailer.createTransport({
  //         host: "mx5.mailspace.id",
  //         port: 465,
  //         secure: true,
  //         auth: {
  //           user: "noreply@lockify.space",
  //           pass: "@Sandiku197",
  //         },
  //       });
  const mailOptions = {
    from: '"Chemicfest" <noreply@lockify.space>',
    to: to,
    subject: "E-Ticket Chemicfest Anda",
    html: `
      <!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-Ticket</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-200 flex justify-center items-center min-h-screen">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
      <h2 class="text-2xl font-bold text-blue-600">E-Ticket Pembelian</h2>
      <p class="mt-2 text-gray-700">Berikut adalah E-Ticket pembelian Anda.</p>
      <a class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md" href="https://eticket.chemicfest.site/download/${orderId}" >Download E-Ticket</a>
    </div>
  </body>
</html>
    `,
    attachments: attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email E-Tickeberhasil dikirim ke:", to);
    return true;  // ✅ Berhasil, lanjut buat tiket
  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    return false; // ❌ Gagal, tiket tidak dibuat
  }
}

async function generateEticket(transaction, urlTicket, order_id, amount) {
  const user = transaction.user;
  const quantity = transaction.tickets.length || 1;
  const productId = transaction.ticketOffline?.productId;
  
  console.log(`Barcode :`,urlTicket)

  try {
    if (!productId) {
      console.error("❌ Product ID tidak ditemukan dalam ticketOffline.");
      return;
    }

    const uploadDir = path.join(__dirname, "../../file/eTicket");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const qrPath = path.join(__dirname, `../../file/qrcode/${urlTicket}.png`);
    const pdfPath = path.join(uploadDir, `${urlTicket}.pdf`); 

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    
   
    doc
      .fontSize(24)
      .fillColor('blue') 
      .text("Chemicfest #9 - E-Ticket", { align: "center", underline: true })
      .moveDown(1);
    

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    
    
    doc.fillColor('black') 
      .fontSize(16)
      .text("Informasi Acara:", { bold: true })
      .moveDown(1);
    doc.fontSize(12).text("Nama Event: Chemicfest #9");
    doc.text("Penyelenggara: OSIS SMK SMTI Yogyakarta");
    doc.text("Tanggal: 17 Mei 2025");
    doc.text("Lokasi: GOR UMY, Jl. Brawijaya, Ngebel, Tamantirto, Kasihan, Bantul, Yogyakarta");
    doc.moveDown(2);
    
    // Garis pemisah
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    
    // Informasi Pemesan
    doc.fontSize(16).text("Informasi Pemesan:", { bold: true }).moveDown(1);
    doc.fontSize(12).text(`Kode Pesanan: ${order_id}`);
    doc.text(`Nama Pemesan: ${user.email}`);
    doc.text(`Jumlah Tiket: ${quantity} Pax`);
    doc.text("Validitas: 17 Mei 2025");
    doc.moveDown(2);
    
    // Garis pemisah
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    
    // Harga
    doc.fontSize(16).text(`Total Harga: IDR ${amount}`, { bold: true });
    doc.moveDown(2);
    
    // Tambah QR Code
    if (fs.existsSync(qrPath)) {
      doc.image(qrPath, {
        fit: [150, 150],
        align: "center",
      });
    }
    doc.moveDown(3); 

// Tanggal pembuatan
// doc.fontSize(12).text("Dibuat pada 17 Agustus 1945", { align: "center" });
doc.moveDown(5); 

// Garis pemisah
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(3); 

// Syarat & Ketentuan
doc.fontSize(16).text("Syarat & Ketentuan:", { bold: true }).moveDown(2);
doc.fontSize(12).text("- Maks. pembelian 1 tiket per akun/ID per show day.");
doc.text("- Wajib login ke akun chemicfest9.site untuk melakukan pembelian.");
    
    doc.end();
    

    console.log("✅ Email berhasil dikirim ke:", user.email);

    await generateInvoice(transaction);

    return new Promise((resolve) => {
      stream.on("finish", () => {
        console.log("✅ PDF selesai dibuat:", pdfPath);
        resolve(true); 
      });
    });
  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    return false; 
  }
}

module.exports = midtransWebHook;
