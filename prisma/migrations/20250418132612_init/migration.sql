/*
  Warnings:

  - The values [Eksternal,Internal,Guru,Keluarga_Siswa,Alumni] on the enum `Type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Type_new" AS ENUM ('eksternal', 'internal', 'guru', 'keluarga_Siswa', 'alumni');
ALTER TABLE "TicketOffline" ALTER COLUMN "ticket_type" DROP DEFAULT;
ALTER TABLE "TicketOffline" ALTER COLUMN "ticket_type" TYPE "Type_new" USING ("ticket_type"::text::"Type_new");
ALTER TYPE "Type" RENAME TO "Type_old";
ALTER TYPE "Type_new" RENAME TO "Type";
DROP TYPE "Type_old";
ALTER TABLE "TicketOffline" ALTER COLUMN "ticket_type" SET DEFAULT 'eksternal';
COMMIT;

-- AlterTable
ALTER TABLE "TicketOffline" ALTER COLUMN "ticket_type" SET DEFAULT 'eksternal';
