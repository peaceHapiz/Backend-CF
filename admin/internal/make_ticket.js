const express = require('express')
const app = express()
const router = express.Router()
const prisma  = require('../../src/model/model')
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { or } = require('ip');

// const {generateEticket} = require('../../src/controller/tiket_controller/eticket-controller')
const {sendInvoiceEmail, generateInvoice} = require('../../admin/internal/make_invoice')
function generateRandomId(role) {
    const registrationDate = new Date();
    let result = "";
    const characters = "1234567890";
    const date = new Date(registrationDate);
    const formattedDate =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0");
  
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    if (result.startsWith("0")) {
      result = result.replace("0", "1");
    }
  
    switch (role.toLowerCase()) {
      case "pelajar":
        return `P-${formattedDate}-${result}`;
      case "guru":
        return `G-${formattedDate}-${result}`;
      case "mahasiswa":
        return `M-${formattedDate}-${result}`;
      case "umum":
        return `U-${formattedDate}-${result}`;
      case "admin":
        return `A-${formattedDate}-${result}`;
      default:
        throw new Error("Role tidak valid");
    }
  }

async function sendEmail(to, attachments, orderId) {
  let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "penjualkelpshake@gmail.com",
        pass: "hizm cxcw fsiq smxr",
      },
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

async function generateQR(user, urlTicket,uniqueCode, productId, orderId , transaction) {
    const uploadDir = path.join(__dirname, "../../file/qrcode");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

    let attachments = [];
    let inlineImages = [];

    const qrFilePath = path.join(uploadDir, `${urlTicket}.png`);

    await QRCode.toFile(qrFilePath, urlTicket)

    const cid = `qrcode@chemicfest`;
    attachments.push({
      filename: `${urlTicket}.png`,
      path: qrFilePath,
      cid: cid,
    });
    inlineImages.push(`<img src="cid:${cid}" alt="QR Code" />`);

    const emailSent = await sendEmail(user.email, attachments,  urlTicket);

    if(emailSent){
        const qrUrl = `https://etiket.chemicfest9.site/qrcode/${urlTicket}.png`;

        const ticket = await prisma.ticket.create({
            data : {
                transactionId : transaction.id,
                userId : user.id,
                productId : parseInt(productId),
                bookingCode : uuidv4().slice(0, 8),
                passCode : uniqueCode.toString(),
                venue : "Offline",
                needed : 1,
                type : "Tiket Internal",              
              }
        })

        await prisma.urlTicket.create({
          data : {
            ticketId : ticket.id,
            barcode : urlTicket,
            qrcode : qrUrl,
            eTicket : `https://etiket.chemicfest9.site/${urlTicket}`,
            downloadETicket : `https://etiket.chemicfest9.site/download/${urlTicket}`,
            invoice : `https://etiket.chemicfest9.site/invoice/${orderId}`,
            downloadInvoice : `https://etiket.chemicfest9.site/download/${orderId}`
          }
        })
        console.log("✅ QR Code berhasil dibuat");
       return true
    }else{
        console.error("❌ Gagal mengirim email")
    }
}

async function generateEticket(user, urlTicket,orderId, amount) {
  try {
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

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    

    doc.fontSize(16).text("Informasi Pemesan:", { bold: true }).moveDown(1);
    doc.fontSize(12).text(`Kode Pesanan: ${orderId}`);
    doc.text(`Nama Pemesan: ${user.email}`);
    doc.text(`Jumlah Tiket: ${amount} Pax`);
    doc.text("Validitas: 17 Mei 2025");
    doc.moveDown(2);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    

    doc.fontSize(16).text(`Total Harga: IDR ${amount}`, { bold: true });
    doc.moveDown(2);
    

    if (fs.existsSync(qrPath)) {
      doc.image(qrPath, {
        fit: [150, 150],
        align: "center",
      });
    }
    doc.moveDown(3); 


// doc.fontSize(12).text("Dibuat pada 17 Agustus 1945", { align: "center" });
doc.moveDown(5); 


doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(3); 

doc.fontSize(16).text("Syarat & Ketentuan:", { bold: true }).moveDown(2);
doc.fontSize(12).text("- Maks. pembelian 1 tiket per akun/ID per show day.");
doc.text("- Wajib login ke akun chemicfest9.site untuk melakukan pembelian.");
    
    doc.end();
    

    console.log("✅ Email berhasil dikirim ke:", user.email);

    await generateInvoice(user, orderId);

    return new Promise((resolve) => {
      stream.on("finish", () => {
        console.log("✅ PDF selesai dibuat:", pdfPath);
        resolve(true); 
      });

      setTimeout(() => {
        console.warn("⚠️ PDF timeout, resolve paksa.");
        resolve(false);
      }, 10000);
    });
    
  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    return false; 
  } 
}

router.post('/make-ticket', async(req,res) => {
    const {name, email , phone, ticket_id} = req.body

    try {

      if(!name || !email || !phone || !ticket_id){
        return res.status(400).json({code : 400, message : "Data tidak lengkap"})
      }

        const findUser = await prisma.user.findUnique({
            where : {
                email : email
            }
        })

        if(findUser){
            return res.status(400).json({code : 400, message : "User sudah terdaftar"})
        }



        const createUser = await prisma.user.create({
            data : {
              id : generateRandomId("pelajar"),
                name : name,
                username : name,
                email : email,
                password : email,
                phoneNumber : phone.toString(), 
                verified : true,
                add_verified : true,
                role : "pelajar"
            }
        })

        const findTicket = await prisma.ticketOffline.findFirst({
          where: {
            productId : parseInt(ticket_id)
          }
          
        })

        if(!findTicket)
        {
            return res.status(400).json({code : 400, message : "Tiket tidak ada"})
        }

        const uniqueCode = Math.floor(10000 + Math.random() * 90000);
        const urlTicket = `T-${createUser.id}-${uniqueCode}`;
        console.log(`urlTicket: ${urlTicket}`);


        const order_id = `ORDER-${Date.now()}`;
        const amount = findTicket.price;

        const transaction= await prisma.ticketTransaction.create({
          data: {
            userId: createUser.id,
            productId: findTicket.productId,
            paymentStatus: "successful", 
            ticketOfflineId: findTicket.id,
           
          }
        });

        const qrSucces = await generateQR(createUser, urlTicket,uniqueCode, ticket_id, order_id, transaction)
        const eTicketSucces = await generateEticket(createUser, urlTicket, order_id, amount)

        

        return res.status(200).json({code : 200, message : "Ticket berhasil dibuat"})


    } catch (error) {
        console.log(error.message)
        res.status(500).json({code : 500, message : error.message})
    }
})

module.exports = router