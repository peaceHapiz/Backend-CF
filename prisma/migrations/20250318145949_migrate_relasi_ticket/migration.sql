/*
  Warnings:

  - Added the required column `ticketOfflineId` to the `TicketTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TicketTransaction" ADD COLUMN     "ticketOfflineId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TicketTransaction" ADD CONSTRAINT "TicketTransaction_ticketOfflineId_fkey" FOREIGN KEY ("ticketOfflineId") REFERENCES "TicketOffline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
