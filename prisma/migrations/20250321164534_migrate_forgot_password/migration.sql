/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Forgot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Forgot_userId_key" ON "Forgot"("userId");
