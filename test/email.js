const nodemailer = require("nodemailer");

async function sendTestEmail() {
  // Buat akun SMTP dummy (hanya untuk testing)


  // Konfigurasi transporter
  let transporter = nodemailer.createTransport({
          host: "mx5.mailspace.id",
          port: 465,
          secure: true,
          auth: {
            user: "noreply@lockify.space",
            pass: "@Sandiku197",
          },
        });

  // Konfigurasi email
  let mailOptions = {
    from: '"Chemicfest" <noreply@chemicfest.com>',
    to: "penjualkelpshake@gmail.com", // Ubah dengan email tujuan
    subject: "Simulasi Pengiriman Email",
    text: "Ini adalah email uji coba dari sistem Chemicfest.",
    html: `<h3>Halo!</h3><p>Ini adalah email uji coba.</p>`,
  };

  // Kirim email
  let info = await transporter.sendMail(mailOptions);

  console.log("✅ Email berhasil dikirim:", info.messageId);
  console.log("📩 Preview email:", nodemailer.getTestMessageUrl(info));
}

// Jalankan fungsi
sendTestEmail().catch(console.error);
