/*
  Warnings:

  - You are about to drop the `ProductDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductDetail" DROP CONSTRAINT "ProductDetail_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTransaction" DROP CONSTRAINT "ProductTransaction_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTransaction" DROP CONSTRAINT "ProductTransaction_userId_fkey";

-- DropTable
DROP TABLE "ProductDetail";

-- DropTable
DROP TABLE "ProductPayment";

-- DropTable
DROP TABLE "ProductTransaction";

-- DropTable
DROP TABLE "Shop";
