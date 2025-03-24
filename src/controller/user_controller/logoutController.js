const express = require('express')
const router = express.Router()
const prisma = require('../../model/model')

router.post('/logout', async (req,res) => {
  const {sessionId} = req.body

    try {
        if (!sessionId) {
            return res.status(400).json({ code: 400, message: "Session ID is required" });
          }

    const session = await prisma.session.findFirst({
        where: { id: sessionId },
        include: { user: true }, 
      });
      

      if (!session) {
        return res
          .status(200)
          .json({ code: 200, message: "Logged out, but session expired" });
      }

      await prisma.session.delete({
        where: { id: sessionId },
      });

      const activeSessions = await prisma.session.count({
        where: { userId: session.userId },
      });
  
      console.log( `User ${session.user.name} logged out`);
  
      return res.status(200).json({
        code: 200,
        message: "Logged out successfully",
        activeSessions: activeSessions,
      });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
    

})

module.exports = router