-- Link da resolucao de desafio + publicacoes dentro de grupos.
--
-- UserChallengeCompletion.submissionUrl guarda o link que o aluno informa ao concluir
-- um desafio. Nulo so para as conclusoes feitas antes desta migration; a API passa a
-- exigir o campo em toda conclusao nova.
--
-- Post.groupId separa o feed geral (nulo) do feed de cada grupo. Cascade: o conteudo
-- foi escrito para o contexto do grupo e nao faz sentido no feed geral sem ele.
--
-- O indice de autor ganha createdAt porque o filtro "Meus Posts" agora e feito no
-- banco, sempre ordenado por data. O novo e criado antes de o antigo sair, para a
-- tabela nunca ficar sem indice de autor.
--
-- Tudo aditivo: o codigo anterior continua funcionando com o schema novo, o que
-- mantem segura a janela entre a migration e o deploy da API.

-- AlterTable
ALTER TABLE "UserChallengeCompletion" ADD COLUMN     "submissionUrl" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "groupId" INTEGER;

-- CreateIndex
CREATE INDEX "Post_authorId_createdAt_idx" ON "Post"("authorId", "createdAt");

-- DropIndex
DROP INDEX "Post_authorId_idx";

-- CreateIndex
CREATE INDEX "Post_groupId_createdAt_idx" ON "Post"("groupId", "createdAt");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
