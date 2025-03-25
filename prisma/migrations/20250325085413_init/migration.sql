/*
  Warnings:

  - A unique constraint covering the columns `[bookingCode]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passCode]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ticket_bookingCode_key" ON "Ticket"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_passCode_key" ON "Ticket"("passCode");
