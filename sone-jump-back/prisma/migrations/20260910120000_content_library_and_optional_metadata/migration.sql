-- Biblioteca de conteudo unificada + metadados opcionais.
--
-- RoadmapNodeResource.contentItemId liga o recurso de um no do roadmap a um item
-- do catalogo. O mesmo conteudo (um video de logica, por exemplo) serve a varias
-- carreiras; sem a referencia o link seria duplicado em cada uma e teria de ser
-- corrigido em cada uma quando morresse. Nulo continua valendo para link avulso.
--
-- durationMinutes e rating deixam de ser obrigatorios. Conteudo gratuito nao tem
-- nota de onde tirar, e "duracao" nao significa nada para uma pagina de
-- documentacao. Obrigatorios, forcariam inventar o valor a cada cadastro.
--
-- externalKey e a chave estavel do arquivo de curadoria, o que torna a importacao
-- idempotente.

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentPlatform" ADD VALUE 'DOCUMENTACAO';
ALTER TYPE "ContentPlatform" ADD VALUE 'FREECODECAMP';

-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "externalKey" TEXT,
ALTER COLUMN "durationMinutes" DROP NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "rating" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RoadmapNodeResource" ADD COLUMN     "contentItemId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_externalKey_key" ON "ContentItem"("externalKey");

-- CreateIndex
CREATE INDEX "RoadmapNodeResource_contentItemId_idx" ON "RoadmapNodeResource"("contentItemId");

-- AddForeignKey
ALTER TABLE "RoadmapNodeResource" ADD CONSTRAINT "RoadmapNodeResource_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

