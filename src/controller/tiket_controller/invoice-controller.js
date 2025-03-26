const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");



async function generateInvoice(transaction) {
  const user = transaction.user;
  const orderId = transaction.payment.orderId;
  const invoiceDir = path.join(__dirname, "../../../file/invoice");

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }

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
  doc.text("Email: support@chemicfest.com | Tel: +62 812-3456-7890", { align: "center" });
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
  
  transaction.tickets.forEach((ticket, index) => {
    doc.text(`${index + 1}. ${ticket.type} - Booking Code: ${ticket.bookingCode}`);
    doc.text(`   Venue: ${ticket.venue} | Passcode: ${ticket.passCode}`);
    doc.moveDown(0.5);
  });

  // Payment Summary
  doc.moveDown();
  doc.fontSize(14).font("Helvetica-Bold").text("Ringkasan Pembayaran:");
  doc.fontSize(12).font("Helvetica");
  doc.text(`Metode Pembayaran: Midtrans`);
  doc.text(`Total Pembayaran: Rp ${transaction.payment.amount.toLocaleString()}`);
  doc.text(`Status: ${transaction.payment.status}`);
  doc.moveDown();

  // Footer
  doc.moveDown();
  doc.fontSize(12).font("Helvetica").text("Terima kasih telah membeli tiket di Chemicfest!", { align: "center" });
  doc.text("Silakan simpan invoice ini sebagai bukti pembayaran.", { align: "center" });

  doc.end();

  await sendInvoiceEmail(user.email, invoicePath, orderId);

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(true));
    stream.on("error", reject);

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
