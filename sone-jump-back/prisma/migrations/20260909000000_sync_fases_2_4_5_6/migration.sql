-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PUBLICADO', 'RASCUNHO', 'ARQUIVADO');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDENTE';

-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PUBLICADO';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastStudyDate" DATE;

-- CreateTable
CREATE TABLE "LiveQuestionVote" (
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveQuestionVote_pkey" PRIMARY KEY ("userId","questionId")
);

-- AddForeignKey
ALTER TABLE "LiveQuestionVote" ADD CONSTRAINT "LiveQuestionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveQuestionVote" ADD CONSTRAINT "LiveQuestionVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LiveQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
