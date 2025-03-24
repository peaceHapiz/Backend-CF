/*
  Warnings:

  - Added the required column `productId` to the `TicketTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TicketTransaction" ADD COLUMN     "productId" TEXT NOT NULL;
