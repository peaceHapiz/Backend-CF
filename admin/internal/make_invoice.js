const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const prisma  = require('../../src/model/model')




async function generateInvoice(user, orderId) {
  
  const invoiceDir = path.join(__dirname, "../../file/invoice");

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }

  const ticket = await prisma.ticket.findFirst({
    where : {
        userId : user.id
    }
  })

  const ticketInfo = await prisma.ticketOffline.findUnique({
    where : {
        productId : ticket.productId
    }
  })

  const invoicePath = path.join(invoiceDir, `${orderId}.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(invoicePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "center" });
  doc.moveDown();

  // Company Details
  doc.fontSize(12).font("Helvetica").text("Chemicfest Event Organizer", { align: "center" });
  doc.text("Jl. Kusumanegara No 3, Yogyakarta", { align: "center" });
  doc.text("Email: noreply@chemicfest9.site | Tel: +62 812-3456-7890", { align: "center" });
  doc.moveDown();
  doc.moveDown();

  // Invoice Details
  doc.fontSize(14).font("Helvetica-Bold").text(`Invoice No: ${orderId}`, { align: "left" });
  doc.fontSize(12).font("Helvetica").text(`Tanggal: ${new Date().toLocaleDateString()}`, { align: "left" });
  doc.moveDown();

  // Customer Details
  doc.fontSize(14).font("Helvetica-Bold").text("Detail Pembeli:");
  doc.fontSize(12).font("Helvetica").text(`Nama: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.moveDown();

  // Ticket Details Table
  doc.fontSize(14).font("Helvetica-Bold").text("Detail Tiket:");
  doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica");
  

    doc.text(`${ticket.type} - Booking Code: ${ticket.bookingCode}`);
    doc.text(`   Venue: ${ticket.venue} | Passcode: ${ticket.passCode}`);
    doc.moveDown(0.5);


  // Payment Summary
  doc.moveDown();
  doc.fontSize(14).font("Helvetica-Bold").text("Ringkasan Pembayaran:");
  doc.fontSize(12).font("Helvetica");
  doc.text(`Metode Pembayaran: Midtrans`);
  doc.text(`Total Pembayaran: Rp ${ticketInfo.price}`);
  doc.text(`Status: Success`);
  doc.moveDown();

  // Footer
  doc.moveDown();
  doc.fontSize(12).font("Helvetica").text("Terima kasih telah membeli tiket di Chemicfest!", { align: "center" });
  doc.text("Silakan simpan invoice ini sebagai bukti pembayaran.", { align: "center" });

  doc.end();

  await sendInvoiceEmail(user.email, invoicePath, orderId);

  return new Promise((resolve) => {
    stream.on("finish", () => {
      console.log("✅ PDF selesai dibuat:", pdfPath);
      resolve(true); 
    });
  
    // fallback jika tidak selesai dalam 10 detik
    setTimeout(() => {
      console.warn("⚠️ PDF timeout, resolve paksa.");
      resolve(false);
    }, 10000);
  });
}

async function sendInvoiceEmail(to, invoicePath, orderId) {
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
    subject: "Invoice Pembelian Tiket Chemicfest",
    text: `Halo, berikut adalah invoice pembelian tiket Anda. Order ID: ${orderId}`,
    attachments: [
      {
        filename: `${orderId}.pdf`,
        path: invoicePath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email invoice berhasil dikirim ke:", to);
  } catch (error) {
    console.error("❌ Gagal mengirim email invoice:", error);
  }
}

module.exports = { generateInvoice, sendInvoiceEmail };
