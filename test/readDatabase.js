const prisma = require('../src/model/model')
async function cekTransaksiPending() {

  const id = "a161ca7e-3cf4-449a-98a5-e7b589d64458"
  const barcodeName = await prisma.urlTicket.findFirst({
    where : {
      ticketId : id,
    },
    select : {
      barcode : true
    }
  })

  const data = barcodeName.barcode
    console.log(data)
}
try {
  cekTransaksiPending()
  
} catch (error) {
  console.log(error.message)
}
