/*
  Warnings:

  - Added the required column `ticket_for` to the `TicketOffline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TicketOffline" ADD COLUMN     "ticket_for" "Role" NOT NULL;
