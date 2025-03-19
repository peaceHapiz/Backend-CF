const express = require("express");
const router = express.Router();
const prisma = require("../../src/model/model");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// Buat folder "files" jika belum ada
const FILES_DIR = path.join(__dirname, "./file/excel");
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

router.get("/export-tickets", async (req, res) => {
    try {
        const { fileName, ticketType } = req.body; // Nama file & filter tipe tiket

        if (!fileName) {
            return res.status(400).json({ message: "❌ Nama file wajib diisi!" });
        }

        // **Ambil transaksi tiket yang sudah berhasil**
        const whereClause = { paymentStatus: "successful" };
        if (ticketType) whereClause.tickets = { some: { type: ticketType } };

        const transactions = await prisma.ticketTransaction.findMany({
            where: whereClause,
            include: {
                user: true,
                payment: true,
                tickets: {
                    include: { urlTicket: true }
                }
            }
        });

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "❌ Tidak ada transaksi yang ditemukan!" });
        }

        // **Buat file Excel**
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Transaksi Tiket");

        // **Buat header kolom**
        worksheet.columns = [
            { header: "ID Transaksi", key: "transactionId", width: 25 },
            { header: "User ID", key: "userId", width: 25 },
            { header: "Nama User", key: "userName", width: 25 },
            { header: "Metode Pembayaran", key: "paymentMethod", width: 20 },
            { header: "Status Pembayaran", key: "paymentStatus", width: 20 },
            { header: "Jumlah Pembayaran", key: "amount", width: 15 },
            { header: "Waktu Transaksi", key: "createdAt", width: 25 },
            { header: "Kode Tiket", key: "ticketCode", width: 20 },
            { header: "Tipe Tiket", key: "ticketType", width: 20 },
            { header: "URL Tiket", key: "ticketUrl", width: 40 }
        ];

        // **Isi data transaksi ke dalam Excel**
        transactions.forEach((transaction) => {
            transaction.tickets.forEach((ticket) => {
                worksheet.addRow({
                    transactionId: transaction.id,
                    userId: transaction.user.id,
                    userName: transaction.user.name,
                    paymentMethod: transaction.payment?.method || "N/A",
                    paymentStatus: transaction.payment?.status || "N/A",
                    amount: transaction.payment?.amount || 0,
                    createdAt: transaction.createdAt.toISOString(),
                    ticketCode: ticket.ticketCode || "N/A",
                    ticketType: ticket.type,
                    ticketUrl: ticket.urlTicket?.eTicket || "N/A"
                });
            });
        });

        const now = Date.now()
        // **Simpan file Excel ke folder `/files/`**
        const filePath = path.join(FILES_DIR, `${fileName}-${now}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        // **Kirim file untuk diunduh frontend**
        res.download(filePath, `${fileName}.xlsx`, (err) => {
            if (err) {
                console.error("❌ Gagal mengirim file:", err);
                res.status(500).json({ message: "❌ Terjadi kesalahan dalam mengunduh file" });
            }
        });

    } catch (error) {
        console.error("❌ Error saat ekspor transaksi tiket:", error);
        res.status(500).json({ message: "❌ Terjadi kesalahan server!", error: error.message });
    }
});

module.exports = router;
