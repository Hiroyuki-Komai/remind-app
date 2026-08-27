/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Note";

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortKey" INTEGER NOT NULL,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blank" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "ordinal" INTEGER,
    "answerKey" TEXT NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxMissCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Blank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlankLog" (
    "id" TEXT NOT NULL,
    "blankId" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "BlankLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quality" INTEGER NOT NULL,
    "repetitionAfter" INTEGER NOT NULL,
    "easeFactorAfter" DOUBLE PRECISION NOT NULL,
    "intervalAfter" INTEGER NOT NULL,
    "dueDateAfter" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_sortKey_key" ON "Card"("sortKey");

-- CreateIndex
CREATE INDEX "Card_dueDate_idx" ON "Card"("dueDate");

-- CreateIndex
CREATE INDEX "Card_sortKey_idx" ON "Card"("sortKey");

-- CreateIndex
CREATE INDEX "Blank_cardId_deletedAt_idx" ON "Blank"("cardId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Blank_cardId_ordinal_key" ON "Blank"("cardId", "ordinal");

-- CreateIndex
CREATE INDEX "BlankLog_blankId_answeredAt_idx" ON "BlankLog"("blankId", "answeredAt");

-- CreateIndex
CREATE INDEX "ReviewLog_cardId_reviewedAt_idx" ON "ReviewLog"("cardId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "Blank" ADD CONSTRAINT "Blank_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlankLog" ADD CONSTRAINT "BlankLog_blankId_fkey" FOREIGN KEY ("blankId") REFERENCES "Blank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
