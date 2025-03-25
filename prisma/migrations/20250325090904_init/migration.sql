/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `UrlTicket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UrlTicket_barcode_key" ON "UrlTicket"("barcode");
