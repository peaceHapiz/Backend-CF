/*
  Warnings:

  - You are about to drop the column `scanned` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "scanned",
ADD COLUMN     "isScanned" BOOLEAN NOT NULL DEFAULT false;
