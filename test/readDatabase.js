const prisma = require('../src/model/model')
async function cekTransaksiPending() {
    const pendingTransactions = await prisma.ticketTransaction.findMany({
        include: { payment: true, user: true , tickets:true},
      });
      const product_Id = pendingTransactions.tickets.productId
    
      console.log(product_Id)
}
