const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Baca file JSON

const configPath = path.join(__dirname, "../db/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Ambil data email berdasarkan mode produksi
const emailConfig = config.EmailOTP.isProduction
  ? config.EmailOTP.ProductionEmail
  : config.EmailOTP.SandboxEmail; // Jika ada mode sandbox

async function sendTestEmail() {
  // let transporter = nodemailer.createTransport({
  //   host: emailConfig.service,
  //   port: emailConfig.port,
  //   secure: emailConfig.secure,
  //   auth: {
  //     user: emailConfig.user,
  //     pass: emailConfig.pass,
  //   },
  // });

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "penjualkelpshake@gmail.com",
      pass: "hizm cxcw fsiq smxr",
    },
});

  // Verifikasi koneksi SMTP
  transporter.verify((error, success) => {
    if (error) {
      console.log("❌ SMTP Error:", error);
    } else {
      console.log("✅ SMTP Server Ready to Send Emails");
    }
  });

  let mailOptions = {
    from: `"noreply@chemicfest9.site`,
    to: "penjualkelpshake@gmail.com",
    subject: "Simulasi Pengiriman Email",
    text: "Ini adalah email uji coba dari sistem Chemicfest.",
    html: `<h3>Halo!</h3><p>Ini adalah email uji coba.</p>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email berhasil dikirim:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

sendTestEmail().catch(console.error);
