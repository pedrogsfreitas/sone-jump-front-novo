-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experienceLevel" "OnboardingLevel";

-- AlterTable
ALTER TABLE "UserRoadmapProgress" ADD COLUMN     "quizPassedAt" TIMESTAMP(3),
ADD COLUMN     "studyConfirmedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RoadmapNodeQuizQuestion" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoadmapNodeQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapNodeQuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoadmapNodeQuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoadmapNodeQuizQuestion_nodeId_orderIndex_idx" ON "RoadmapNodeQuizQuestion"("nodeId", "orderIndex");

-- CreateIndex
CREATE INDEX "RoadmapNodeQuizOption_questionId_orderIndex_idx" ON "RoadmapNodeQuizOption"("questionId", "orderIndex");

-- AddForeignKey
ALTER TABLE "RoadmapNodeQuizQuestion" ADD CONSTRAINT "RoadmapNodeQuizQuestion_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapNodeQuizOption" ADD CONSTRAINT "RoadmapNodeQuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "RoadmapNodeQuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Migração de DADOS: slug da carreira passa para a forma curta.
--
-- O slug é a identidade da carreira em três lugares que precisavam falar a mesma
-- língua e não falavam: a URL, o arquivo de importação de roadmap e o enum
-- OnboardingArea. Antes existiam três grafias para a mesma coisa
-- ("FRONTEND", "frontend", "frontend-developer"), e o front acabou mantendo uma base
-- mockada só por causa disso. O `title` continua sendo "Frontend Developer" — o que
-- muda é o identificador, não o nome exibido.
--
-- Os UPDATEs são condicionais pelo valor antigo, então reaplicar não faz nada.
-- ============================================================
UPDATE "Career" SET "slug" = 'frontend'     WHERE "slug" = 'frontend-developer';
UPDATE "Career" SET "slug" = 'backend'      WHERE "slug" = 'backend-developer';
UPDATE "Career" SET "slug" = 'data-science' WHERE "slug" = 'data-scientist';
UPDATE "Career" SET "slug" = 'devops'       WHERE "slug" = 'devops-engineer';
UPDATE "Career" SET "slug" = 'mobile'       WHERE "slug" = 'mobile-developer';
UPDATE "Career" SET "slug" = 'ux-ui'        WHERE "slug" = 'ux-ui-designer';
