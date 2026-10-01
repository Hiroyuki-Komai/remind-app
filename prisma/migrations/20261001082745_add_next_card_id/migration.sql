/*
  Warnings:

  - A unique constraint covering the columns `[nextCardId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "nextCardId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Card_nextCardId_key" ON "Card"("nextCardId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_nextCardId_fkey" FOREIGN KEY ("nextCardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
