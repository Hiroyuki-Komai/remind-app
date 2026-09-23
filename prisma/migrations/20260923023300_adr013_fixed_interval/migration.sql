/*
  Warnings:

  - You are about to drop the column `easeFactor` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `interval` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `repetition` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `easeFactorAfter` on the `ReviewLog` table. All the data in the column will be lost.
  - You are about to drop the column `intervalAfter` on the `ReviewLog` table. All the data in the column will be lost.
  - You are about to drop the column `quality` on the `ReviewLog` table. All the data in the column will be lost.
  - You are about to drop the column `repetitionAfter` on the `ReviewLog` table. All the data in the column will be lost.
  - Added the required column `intervalStepAfter` to the `ReviewLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCorrect` to the `ReviewLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Card_dueDate_idx";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "easeFactor",
DROP COLUMN "interval",
DROP COLUMN "repetition",
ADD COLUMN     "intervalStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "masteredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ReviewLog" DROP COLUMN "easeFactorAfter",
DROP COLUMN "intervalAfter",
DROP COLUMN "quality",
DROP COLUMN "repetitionAfter",
ADD COLUMN     "intervalStepAfter" INTEGER NOT NULL,
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL;

-- CreateIndex
CREATE INDEX "Card_masteredAt_dueDate_idx" ON "Card"("masteredAt", "dueDate");
