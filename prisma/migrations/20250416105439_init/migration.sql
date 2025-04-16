/*
  Warnings:

  - You are about to drop the column `ticket_for` on the `TicketOffline` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('Eksternal', 'Internal', 'Guru', 'Keluarga_Siswa', 'Alumni');

-- AlterTable
ALTER TABLE "TicketOffline" DROP COLUMN "ticket_for",
ADD COLUMN     "ticket_type" "Type" NOT NULL DEFAULT 'Eksternal';
