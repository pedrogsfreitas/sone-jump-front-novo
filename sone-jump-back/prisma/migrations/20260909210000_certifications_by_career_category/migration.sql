-- Certificações passam a pertencer a uma (carreira, categoria) do roadmap.
--
-- As 4 certificações antigas eram nomes soltos ("React Básico ao Avançado") sem
-- critério de conquista nenhum: nada no código criava UserCertification, então a tela
-- listava prêmios inalcançáveis e o employability score nunca subia por esse caminho.
-- Como não tinham carreira nem categoria, não há como reaproveitá-las — o seed cria as
-- novas, derivadas do próprio conteúdo.
DELETE FROM "Certification";

-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "careerId" TEXT,
ADD COLUMN     "category" "RoadmapCategory";

-- CreateIndex
CREATE UNIQUE INDEX "Certification_careerId_category_key" ON "Certification"("careerId", "category");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
