-- Remove Trail e TrailModule.
--
-- Trail era um agrupamento administrativo de conteúdo sem nenhum vínculo com o
-- progresso do aluno: o que ele realmente percorre é o RoadmapNode, ligado à carreira.
-- Por isso o painel exibia "matriculados: 0" e "conclusão: 0%" em toda linha — não
-- havia o que contar. Agora que as seis carreiras têm roadmap completo, o conceito
-- ficou redundante, e um CRUD que administra algo que nenhum aluno enxerga é pior do
-- que a ausência dele.
--
-- Nenhum dado de usuário é perdido: não existia relação entre Trail e User.

-- DropForeignKey
ALTER TABLE "TrailModule" DROP CONSTRAINT "TrailModule_trailId_fkey";

-- DropTable
DROP TABLE "Trail";

-- DropTable
DROP TABLE "TrailModule";
