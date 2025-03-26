const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");


async function generateEticket(transaction) {
    const user = transaction.user;
    const quantity = transaction.tickets.length || 1;
    const productId = transaction.ticketOffline?.productId;
    const ticketId = transaction.id;
  
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
      const pdfPath = path.join(uploadDir, `${ticketId}.pdf`);
    
      if (!fs.existsSync(qrPath)) {
        await generateQRCode(ticketId);
      }
    
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
    
      
      console.log("✅ Email berhasil dikirim ke:", to);
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

  module.exports = { generateEticket };