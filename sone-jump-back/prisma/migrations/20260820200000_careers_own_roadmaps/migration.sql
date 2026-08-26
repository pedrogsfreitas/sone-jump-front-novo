-- ============================================================
-- Fase 8a — cada carreira tem o seu próprio roadmap
--
-- Toda coluna obrigatória entra em 3 passos: adiciona NULLABLE, faz o backfill,
-- só então aplica NOT NULL. `NOT NULL` direto derrubaria os nós de roadmap que já
-- existem e, em cascata, todo o `UserRoadmapProgress` preso a eles.
--
-- Nenhum `RoadmapNode.id` é alterado, então nenhuma linha de progresso é tocada:
-- os nós existentes viram os nós da carreira "Frontend Developer".
-- ============================================================

-- ------------------------------------------------------------
-- 1. Career: slug / active / orderIndex
-- ------------------------------------------------------------
ALTER TABLE "Career"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- "UX/UI Designer" -> "ux-ui-designer"; "Frontend Developer" -> "frontend-developer"
UPDATE "Career"
SET "slug" = lower(regexp_replace(regexp_replace("title", '[/ ]+', '-', 'g'), '[^a-zA-Z0-9-]', '', 'g'))
WHERE "slug" IS NULL;

ALTER TABLE "Career" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Career_slug_key" ON "Career"("slug");

-- ------------------------------------------------------------
-- 2. Carreira de destino dos nós existentes.
--    Em banco sem seed a tabela está vazia, e sem esta linha o passo 3 falharia
--    ao aplicar NOT NULL com careerId nulo.
-- ------------------------------------------------------------
INSERT INTO "Career" ("id", "title", "slug", "iconKey", "salaryMin", "salaryMax",
                      "avgMonthsMin", "avgMonthsMax", "description",
                      "jobsDemandLevel", "difficultyLevel", "active", "orderIndex")
SELECT gen_random_uuid()::text, 'Frontend Developer', 'frontend-developer', 'monitor',
       4000, 18000, 8, 12,
       'Crie interfaces modernas e interativas para web.', 'ALTA', 'MEDIA', true, 0
WHERE NOT EXISTS (SELECT 1 FROM "Career" WHERE "slug" = 'frontend-developer');

-- ------------------------------------------------------------
-- 3. RoadmapNode: careerId (nullable -> backfill -> NOT NULL) + externalKey
-- ------------------------------------------------------------
ALTER TABLE "RoadmapNode"
  ADD COLUMN "careerId" TEXT,
  ADD COLUMN "externalKey" TEXT;

UPDATE "RoadmapNode"
SET "careerId" = (SELECT "id" FROM "Career" WHERE "slug" = 'frontend-developer'),
    -- os ids do seed já são chaves legíveis ('html-css', 'react', ...)
    "externalKey" = "id"
WHERE "careerId" IS NULL;

ALTER TABLE "RoadmapNode" ALTER COLUMN "careerId" SET NOT NULL;

ALTER TABLE "RoadmapNode" ADD CONSTRAINT "RoadmapNode_careerId_fkey"
  FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "RoadmapNode_careerId_externalKey_key" ON "RoadmapNode"("careerId", "externalKey");
CREATE INDEX "RoadmapNode_careerId_orderIndex_idx" ON "RoadmapNode"("careerId", "orderIndex");

-- ------------------------------------------------------------
-- 4. Pré-requisitos viram N:N
-- ------------------------------------------------------------
CREATE TABLE "RoadmapNodePrerequisite" (
    "nodeId" TEXT NOT NULL,
    "prerequisiteNodeId" TEXT NOT NULL,

    CONSTRAINT "RoadmapNodePrerequisite_pkey" PRIMARY KEY ("nodeId", "prerequisiteNodeId")
);

CREATE INDEX "RoadmapNodePrerequisite_prerequisiteNodeId_idx"
  ON "RoadmapNodePrerequisite"("prerequisiteNodeId");

-- backfill: cada prerequisiteNodeId atual vira uma linha da junção
INSERT INTO "RoadmapNodePrerequisite" ("nodeId", "prerequisiteNodeId")
SELECT "id", "prerequisiteNodeId" FROM "RoadmapNode" WHERE "prerequisiteNodeId" IS NOT NULL;

ALTER TABLE "RoadmapNodePrerequisite" ADD CONSTRAINT "RoadmapNodePrerequisite_nodeId_fkey"
  FOREIGN KEY ("nodeId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapNodePrerequisite" ADD CONSTRAINT "RoadmapNodePrerequisite_prerequisiteNodeId_fkey"
  FOREIGN KEY ("prerequisiteNodeId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- só depois do backfill a coluna antiga sai
ALTER TABLE "RoadmapNode" DROP CONSTRAINT "RoadmapNode_prerequisiteNodeId_fkey";
ALTER TABLE "RoadmapNode" DROP COLUMN "prerequisiteNodeId";

-- ------------------------------------------------------------
-- 5. RoadmapNodeResource: metadados do link externo
-- ------------------------------------------------------------
ALTER TABLE "RoadmapNodeResource"
  ADD COLUMN "orderIndex" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "platform" "ContentPlatform",
  ADD COLUMN "type" "ContentType",
  ADD COLUMN "durationMinutes" INTEGER,
  ADD COLUMN "free" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "RoadmapNodeResource_nodeId_orderIndex_idx"
  ON "RoadmapNodeResource"("nodeId", "orderIndex");

-- ------------------------------------------------------------
-- 6. User: carreira escolhida (nullable — "ainda não escolheu" é estado válido)
-- ------------------------------------------------------------
ALTER TABLE "User"
  ADD COLUMN "careerId" TEXT,
  ADD COLUMN "careerChosenAt" TIMESTAMP(3);

ALTER TABLE "User" ADD CONSTRAINT "User_careerId_fkey"
  FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_careerId_idx" ON "User"("careerId");

-- ------------------------------------------------------------
-- 7. OnboardingProfile: carreira respondida no quiz
-- ------------------------------------------------------------
ALTER TABLE "OnboardingProfile" ADD COLUMN "careerId" TEXT;

ALTER TABLE "OnboardingProfile" ADD CONSTRAINT "OnboardingProfile_careerId_fkey"
  FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE SET NULL ON UPDATE CASCADE;
