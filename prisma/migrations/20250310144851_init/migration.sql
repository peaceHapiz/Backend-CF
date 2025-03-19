-- DropForeignKey
ALTER TABLE "Forgot" DROP CONSTRAINT "Forgot_userId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Forgot" ADD CONSTRAINT "Forgot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
