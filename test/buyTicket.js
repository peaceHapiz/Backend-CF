const express = require('express');
const { PrismaClient } = require('@prisma/client');
const midtransClient = require('midtrans-client');
const crypto = require('crypto');
const QRCode = require('qrcode');
const moment = require('moment');

const prisma = new PrismaClient();
const router = express.Router();

const midtrans = new midtransClient.Snap({
    isProduction: false, // Ubah ke false jika menggunakan sandbox
    serverKey: 'SB-Mid-server-5ycn5sOjLN4v2SiNt0BCipcg'
});

// Endpoint untuk membeli tiket
router.post('/buy-ticket', async (req, res) => {
    try {
        const { userId, tickets } = req.body;
        
        if (!userId || !tickets || !tickets.length) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        
        const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
        
        const payment = await prisma.payment.create({
            data: {
                orderId: crypto.randomUUID(),
                method: 'midtrans',
                status: 'pending',
                amount: totalAmount,
                unit: 'IDR'
            }
        });
        
        const transaction = await prisma.ticketTransaction.create({
            data: {
                userId,
                paymentId: payment.id,
                paymentStatus: 'pending'
            }
        });
        
        const ticketRecords = await Promise.all(tickets.map(async (ticket) => {
            const uniqueCode = crypto.randomInt(10000, 99999);
            const ticketCode = `T-${moment().format('YYYYMMDD')}-${userId.slice(0, 5)}-${uniqueCode}`;
            
            const qrData = await QRCode.toDataURL(ticketCode);
            
            const newTicket = await prisma.ticket.create({
                data: {
                    transactionId: transaction.id,
                    productId: ticket.productId,
                    venue: ticket.venue,
                    needed: ticket.needed,
                    type: ticket.type,
                    ticketCode,
                    urlTicket: {
                        create: {
                            barcode: ticketCode,
                            qrcode: qrData,
                            eTicket: ticketCode,
                            downloadETicket: qrData,
                            invoice: ticketCode,
                            downloadInvoice: qrData
                        }
                    }
                }
            });
            return newTicket;
        }));
        
        const midtransResponse = await midtrans.createTransaction({
            transaction_details: {
                order_id: payment.orderId,
                gross_amount: totalAmount
            },
            customer_details: {
                email: user.email,
                phone: user.phoneNumber
            }
        });
        
        res.json({ transaction, payment, midtransResponse, tickets: ticketRecords });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// Webhook Midtrans untuk memperbarui status pembayaran
router.post('/midtrans/webhook', async (req, res) => {
    try {
        const { order_id, transaction_status } = req.body;
        
        const payment = await prisma.payment.findUnique({ where: { orderId: order_id } });
        if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
        
        let newStatus = 'pending';
        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            newStatus = 'successful';
        } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
            newStatus = 'failed';
        }
        
        await prisma.payment.update({ where: { id: payment.id }, data: { status: newStatus } });
        await prisma.ticketTransaction.update({ where: { paymentId: payment.id }, data: { paymentStatus: newStatus } });
        
        res.json({ message: 'Status diperbarui', status: newStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

module.exports = router;
