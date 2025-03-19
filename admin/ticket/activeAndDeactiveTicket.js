const prisma  = require('../../model/model')
const express = require('express')
const router = express.Router()

router.post('/ticket/status', async(req,res) => {
  const {ticketId, newStatus}  = req.body

  try {
    const updatedTicket = await prisma.ticketOffline.update({
      where: { id: ticketId },
      data: { isReady: newStatus }
    });

    console.log(`Ticket ID ${ticketId} updated successfully. New status: ${newStatus}`);
    return updatedTicket;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return null;
  }

})



module.exports = router