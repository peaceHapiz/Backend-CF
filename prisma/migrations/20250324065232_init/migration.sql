/*
  Warnings:

  - Changed the type of `productId` on the `TicketTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TicketTransaction" DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL;
