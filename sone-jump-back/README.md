# sone-jump-back

Back-end da plataforma JUMP. NestJS + PostgreSQL + Prisma. Ver o plano de
arquitetura completo (todas as fases) em `C:\Users\pedro\.claude\plans\lucky-moseying-planet.md`.

## Rodando localmente

1. Banco de dados local (gerenciado pelo próprio Prisma, sem precisar de Docker):
   ```
   npx prisma dev -d --name sone-jump-dev
   ```
   Isso sobe um Postgres local persistente. Rode `npx prisma dev ls` para ver a
   connection string se precisar recriar o `.env`.

   Se preferir Postgres via Docker (mais próximo de produção), suba um container
   `postgres:16` manualmente e aponte `DATABASE_URL` para ele — o schema é o mesmo.

2. Variáveis de ambiente:
   ```
   node scripts/gen-env.cjs
   ```
   Gera um `.env` com segredos aleatórios (JWT, HMAC/AES da criptografia de CPF).
   Nunca commitar o `.env` (já está no `.gitignore`). `.env.example` documenta o
   formato esperado de cada variável.

3. Migração + client:
   ```
   npx prisma migrate dev
   npx prisma generate
   ```
   Se `migrate dev` falhar com `type "X" already exists` na *shadow database*, é uma
   incompatibilidade conhecida entre `prisma migrate dev` (que precisa criar um banco
   temporário para calcular o diff) e o Postgres gerenciado do `npx prisma dev`. Nesse
   caso, use `npx prisma db push` para desenvolvimento local (aplica o schema direto,
   sem gerar arquivo de migração) — reserve `migrate dev` de verdade para quando o
   projeto estiver rodando num Postgres real (Docker ou hospedado).

4. Subir a API:
   ```
   npm run start:dev
   ```
   API em `http://localhost:8080/api`, health check em `/api/health`, Swagger em
   `/api/docs` (desabilitado em produção).

## Testes

- `npm test` — unitários (ex.: `src/auth/auth.service.spec.ts`).
- `npm run test:e2e` — fluxo completo via HTTP contra o banco local (registro →
  login → refresh com rotação → perfil). Precisa do banco local rodando.

## O que já existe (Fase 1)

- **Auth**: `POST /api/login/register`, `POST /api/login/authenticate` (mesmos
  paths que o front já chama), `POST /api/auth/refresh`, `POST /api/auth/logout`.
  Access token JWT (15 min) + refresh token opaco rotativo em cookie `httpOnly`
  (30 dias), com detecção de reuso (reutilizar um refresh token já rotacionado
  revoga todas as sessões do usuário).
- **Users**: `GET/PATCH /api/users/me`, resolvidos a partir do JWT — não existe
  mais um endpoint que aceite um `id` arbitrário no corpo (isso seria um IDOR).
- CPF nunca é armazenado em texto puro (hash HMAC para unicidade + AES-256-GCM
  para o caso raro de precisar recuperar o valor; a API só devolve mascarado).
- Senhas em Argon2id. Rate limiting global + reforçado em `/login/*`. Helmet,
  CORS restrito, validação de DTO em toda entrada, filtro global de exceções.
- Schema Prisma cobre **todos** os domínios do produto (roadmap, catálogo,
  comunidade, mercado de trabalho, mentoria, lives, planos/assinatura, admin) —
  o resto é construído fase a fase (ver o plano).

## O que já existe (Fase 2 — core loop de aprendizado)

Todos os endpoints abaixo exigem `Authorization: Bearer <token>`.

- **Roadmap**: `GET /api/roadmap` (grafo de skills com status calculado a partir
  da cadeia de pré-requisitos — nó sem progresso salvo é `AVAILABLE` só se o
  pré-requisito estiver `COMPLETED`, senão `LOCKED`), `PATCH
  /api/roadmap/nodes/:id` (avançar para `IN_PROGRESS`/`COMPLETED` — o servidor
  rejeita com 403 se a etapa ainda estiver bloqueada, então não dá pra "pular"
  etapas direto pela API; completar concede XP = horas × 5).
- **Catálogo**: `GET /api/catalog` (filtros `?type=`/`?platform=`),
  `GET /api/catalog/bookmarks`, `PUT`/`DELETE /api/catalog/:id/bookmark`.
- **Progresso**: `POST /api/progress/sessions` (XP é sempre calculado no
  servidor — 1 XP/minuto — nunca aceito do cliente; atualiza a sequência de dias
  automaticamente), `GET /api/progress/sessions`, `GET /api/progress/summary`
  (XP, nível, sequência, sessões da semana, % por skill — a fonte única que
  substitui os três lugares no front que hoje mostram esse número
  independentemente), `POST/GET/PATCH/DELETE /api/progress/goals`.
- **Skills**: `GET /api/skills/challenges`, `POST
  /api/skills/challenges/:id/complete` (concede XP e sobe a % da(s) skill(s)
  associada(s); 409 se já concluído), `GET/POST/DELETE /api/skills/portfolio`,
  `GET /api/skills/certifications`, `GET /api/skills/progress`, `GET
  /api/skills/employability-score` (heurística simples e documentada no
  código — não é um score de mercado real).

Seed com dados de exemplo (11 nós de roadmap, 4 itens de catálogo, 3 desafios, 4
certificações): `npm run db:seed`.

## O que já existe (Fase 3 — comunidade, vagas, parceiros)

- **Comunidade**: `GET/POST /api/community/posts`, `DELETE
  /api/community/posts/:id` (só o autor), `PUT/DELETE
  /api/community/posts/:id/like`, `GET/POST
  /api/community/posts/:id/comments`, `GET /api/community/groups`,
  `PUT/DELETE /api/community/groups/:id/join`.
- **Vagas**: `GET /api/jobs` (com `match` calculado no servidor a partir da %
  de domínio das skills exigidas — não é um número estático), `POST
  /api/jobs/:id/apply` (409 se já se candidatou), `GET /api/jobs/applications`.
  CRUD de vagas (criar/editar) é recurso de admin — Fase 6.
- **Parceiros**: `GET /api/partners` (só leitura dos ativos; CRUD completo,
  incluindo status "Pendente", é Fase 6/Admin). `Job.partnerId` já liga vaga a
  parceiro — a duplicação de 3 conceitos de "vaga" que o front tinha
  (`Market.tsx`, widget do `Community.tsx`, `AdminParceiros`) agora é uma
  fonte única.

Seed agora também popula 5 grupos, 4 parceiros e 4 vagas de exemplo.

## O que já existe (Fase 5 — planos, assinatura, pagamento, indicação)

Nenhum provedor de pagamento real está integrado ainda (decisão consciente —
sem conta/credenciais de sandbox no momento). Toda a estrutura está pronta com
**um único ponto de integração** isolado em `SubscriptionsService.confirmPayment()`
— é exatamente aí que entraria o webhook do Mercado Pago/Asaas quando houver
provedor escolhido; até lá, o fluxo é testável de ponta a ponta via um endpoint
de simulação **bloqueado em produção** (`DevOnlyGuard` devolve 404, nem revela
que a rota existe).

- **Planos**: `GET /api/plans` (Grátis/Pro/Premium, preços e features vindos
  do banco, não hardcoded no front).
- **Assinatura**: `GET /api/subscriptions/me` (assinatura atual ou Grátis por
  padrão), `POST /api/subscriptions/checkout` (cria assinatura+pagamento
  `PENDENTE`; 409 se já tem assinatura ativa/pendente), `POST
  /api/subscriptions/cancel`.
- **Simulação de pagamento** (só fora de produção): `POST
  /api/subscriptions/payments/:id/simulate { outcome: "PAGO"|"FALHOU" }` —
  ativa a assinatura (`currentPeriodEnd` = +30/365 dias conforme o ciclo) e
  dispara a conversão de indicação, exatamente como o webhook real faria.
- **Indicação/Referral**: `GET /api/referrals/me` (código, indicações,
  conversões, ganhos), `POST /api/referrals/claim { code }`. Comissão de 30%
  sobre o valor pago é creditada automaticamente na primeira conversão (e em
  cada pagamento futuro, já que o front promete "comissão recorrente").

Testei o fluxo completo manualmente: reivindicar código → checkout → simular
pagamento → assinatura vira `ATIVA` → indicador recebe R$14,70 de comissão
(30% de R$49) → tentar novo checkout com assinatura ativa dá 409 → cancelar
volta pro plano Grátis.

## O que já existe (Fase 6 — painel admin)

Todo endpoint abaixo exige `Authorization: Bearer <token>` de um usuário com
`role: ADMIN` — implementado com `RolesGuard` + `@Roles(Role.ADMIN)` (existiam
desde a Fase 1, mas nunca tinham sido usados até agora). É a correção final do
maior problema de segurança que a auditoria do front encontrou: `/admin`
estava **totalmente aberto**, sem checagem nenhuma. Testei: usuário comum
recebe 403, sem token recebe 401.

- **Usuários**: `GET /api/admin/users` (busca por nome/e-mail/username),
  `GET /api/admin/users/stats`, `PATCH /api/admin/users/:id/role`, `PATCH
  /api/admin/users/:id/active` (suspender/reativar — bloqueado pra
  autossuspensão). Suspender de verdade impede login (`403 "Esta conta foi
  suspensa."` — testei).
- **Conteúdo**: CRUD completo sobre o catálogo, agora com `status`
  (Publicado/Rascunho/Arquivado) — testei que rascunho fica invisível no
  `/api/catalog` público e só aparece depois de publicado.
- **Trilhas**: CRUD de `Trail`+`TrailModule`. **Limitação documentada**:
  `enrolled`/`completion` retornam 0 — não existe rastreamento de matrícula
  por trilha ainda (o progresso real do usuário é no `RoadmapNode`, que é uma
  entidade separada). Conectar os dois é trabalho futuro, não escondido.
- **Parceiros**: CRUD completo, incluindo aprovação (`PENDENTE`→`ATIVO`) —
  testei que só parceiros `ATIVO` aparecem no `GET /api/partners` público.
- **Relatórios**: `GET /api/admin/reports/dashboard` (usuários, trilhas
  ativas, receita do mês, taxa de conversão, crescimento mensal, atividade
  recente), `/overview?from&to`, `/funnel?from&to` (cadastros→ativações→
  assinantes→premium, com dados reais, não visitantes anônimos que não
  rastreamos), `/cohorts` (retenção mensal simplificada, baseada em sessões de
  estudo reais).
- **Audit log**: `GET /api/admin/audit-log` — toda ação de admin (mudar role,
  suspender, criar/editar/apagar conteúdo/trilha/parceiro) fica registrada com
  quem fez, o quê, quando. Crítico justamente porque `/admin` era um ponto
  cego de segurança até agora.

**Bug real encontrado e corrigido durante o teste manual**: `PATCH
/admin/users/:id/role` e `/active` estavam devolvendo o objeto `User` completo
do Prisma — incluindo `passwordHash`, `cpfHash` e `cpfEncrypted`. Troquei para
`select` explícito. Isso não teria aparecido em nenhum teste automatizado
óbvio; só apareceu testando de verdade.

Seed cria um admin de teste: `admin` / `AdminSeed123`.

## O que já existe (Fase 4 — mentoria e lives)

- **Mentores**: `GET /api/mentors` (lista pública), `POST /api/mentors/become`
  (qualquer usuário vira mentor — auto-serviço, sem aprovação de admin ainda;
  decisão consciente de escopo, diferente do fluxo de aprovação dos
  Parceiros). Vira `role: MENTOR` de verdade.
- **Sessões de mentoria**: `POST /api/mentorship-sessions` (solicitar),
  `GET .../mine` (como aluno) e `.../hosting` (como mentor), `PATCH
  .../:id/confirm` e `.../:id/complete` (só o mentor dono da sessão — testei
  que o aluno tentando confirmar toma 403), `.../:id/cancel` (qualquer um dos
  dois lados). Concluir uma sessão credita XP pro aluno (50) e incrementa o
  contador de sessões do mentor — testei o ciclo completo (solicitar →
  confirmar → concluir) e os números batem.
- **Lives**: `GET /api/lives`, `GET /api/lives/recordings`, `POST /api/lives`
  (só `MENTOR`/`ADMIN` — testei que aluno comum toma 403), `PATCH
  /api/lives/:id/status` (só o host ou um admin — testei), `GET/POST
  /api/lives/:id/questions`, `PUT
  /api/lives/questions/:id/upvote` (um voto por pessoa por pergunta, via
  tabela de votos própria — testei que votar duas vezes dá 409; isso corrige
  uma falha que existiria se eu só tivesse incrementado o contador direto,
  como o mock do front fazia).

## Revisão de segurança e funcionalidade (18/08/2026)

Auditoria completa dos dois lados antes de conectar o front de verdade.

**Back-end — nada de novo quebrado, 2 lacunas funcionais reais encontradas e
corrigidas:**
- Conferi sistematicamente: todo controller tem o guard certo (`JwtAuthGuard`
  em tudo, `+ RolesGuard/@Roles(ADMIN)` em todo `/admin/*`), nenhum endpoint
  devolve `passwordHash`/`cpfHash`/`cpfEncrypted` (o bug da Fase 6 não se
  repetiu em nenhum outro módulo), todo `:id` numérico usa `ParseIntPipe`,
  toda mutação por dono valida propriedade (mentor só mexe na própria sessão,
  autor só apaga o próprio post, etc). `npm audit`: 0 vulnerabilidades.
- **Faltava um endpoint para `Career`** (usado pela tela Explorar Carreiras) —
  não tinha sido implementado em nenhuma fase. Criado `GET /api/careers` +
  seed com 6 carreiras.
- **Faltava CRUD de vagas para admin** — só existia leitura pública e seed;
  não havia como criar/editar vaga nenhuma. Criado `/api/admin/jobs` (CRUD
  completo, com vínculo a skills e parceiro opcional).

**Front-end — vulnerabilidades reais de dependência corrigidas:**
- `npm audit` achou 8 vulnerabilidades (7 altas) em `react-router-dom`
  (desserialização insegura, CSRF, XSS, DoS) e `vite`. `npm audit fix`
  resolveu tudo sem quebrar nada — testei visualmente depois.
- Dois bugs de código pré-existentes corrigidos (achados pelo lint, não
  relacionados à conexão): um componente React (`StepDots`) sendo recriado a
  cada render dentro do `Onboarding.tsx` (perde estado sempre), e uma
  expressão ternária usada só pelo efeito colateral no `Community.tsx`.

**Conexão de autenticação — feita e testada de ponta a ponta no navegador:**
- `src/services/api.ts` agora anexa `Authorization: Bearer` automaticamente e
  manda `credentials: 'include'` (cookie do refresh token).
- `Login.tsx` chama `login()` de verdade, trata erro (`"Credenciais
  inválidas."` vindo do back, testado ao vivo), guarda o token real.
- `AppLayout`/`AdminLayout` decodificam o JWT (`src/services/auth-storage.ts`)
  e validam expiração de verdade, não só presença. `AdminLayout` ganhou o
  guard que nunca teve: usuário sem `role: ADMIN` é mandado de volta pro
  dashboard, não só barrado silenciosamente — **isso é só proteção de UX, a
  barreira de segurança real continua sendo o `RolesGuard` no back**.
  Testado: login como aluno comum → `/admin` redireciona pro dashboard; login
  como admin → `/admin` carrega normalmente.
- `Onboarding.tsx` não fabrica mais uma sessão falsa (`token: "demo"`) — como
  o front até então nunca cadastrava o usuário nesse fluxo, isso teria virado
  um loop de redirecionamento agora que o guard valida de verdade. Ele manda
  pra `/register` no final; as respostas do questionário ainda não são
  enviadas a lugar nenhum (não existe endpoint pra isso — é trabalho de
  Fase 7).

## Fase 7 — conectando o front de verdade (em andamento)

Cada sub-fase troca os dados mockados de um grupo de páginas pelas chamadas
reais ao back. Progresso:

- **7a (concluída)**: Dashboard, Roadmap, Catálogo, Progresso, Skills,
  Perfil — sem mudança de back, só consumo real do que já existia.
- **7b (concluída)**: Comunidade, Mercado, Carreiras (`/explore`).
  - **`GET /api/careers` deixou de exigir `JwtAuthGuard`.** A tela
    `/explore` é uma landing pública (fora do `/app`, sem login) que
    precisa mostrar as 6 carreiras antes do usuário se cadastrar — igual a
    uma página de preços. O endpoint só devolve dado de catálogo (título,
    faixa salarial, tempo médio), sem nada específico de usuário, então
    torná-lo público é seguro. Testado sem token e com token, os dois
    funcionam.
  - Comunidade: publicar post, curtir/descurtir, comentar e entrar/sair de
    grupo testados de ponta a ponta no navegador, com persistência
    confirmada após reload. O widget "Vagas Compartilhadas" agora chama o
    mesmo `GET /api/jobs` do Mercado (antes eram dados mockados
    duplicados) e o widget "Próximas Sessões" reaproveita `GET /api/lives`
    (dado real, já existente desde a Fase 4).
  - "Top Ranking" (Comunidade) e "Salários por Nível" / "Habilidades em
    Alta" / "Empresas que Contratam" / análise de LinkedIn com IA
    (Mercado) foram removidos — eram conteúdo 100% fabricado no mock, sem
    modelo nenhum no back, e a decisão da Fase 7 é não inventar dado nem
    fingir feature que não existe.
  - Mercado: candidatura a vaga (`POST /api/jobs/:id/apply`) testada,
    incluindo idempotência (segunda tentativa vira botão desabilitado
    "Candidatura Enviada", back retorna 409 se forçado).
- **7c (concluída)**: Mentoria, Lives — sem mudança de back, só consumo real
  do que já existia (`mentors`, `mentorship-sessions`, `lives` completos).
  - Mentoria: solicitar mentoria (`POST /api/mentorship-sessions`) e
    cancelar (`PATCH .../cancel`) testados de ponta a ponta, com sessão
    real aparecendo em "Aguardando confirmação" e depois em "Cancelada" no
    histórico após reload.
  - **Bug real encontrado e corrigido no front**: depois de cancelar uma
    sessão, a tela quebrava (`Cannot read properties of undefined`) porque
    o `PATCH /api/mentorship-sessions/:id/cancel` devolve a linha crua do
    Prisma, sem o `include` do mentor — o front tentava ler
    `session.mentor.user.fullName` de um objeto que não tinha `mentor`.
    Corrigido no front (busca a lista completa de novo após cancelar, em
    vez de usar a resposta crua do PATCH); não mudei o endpoint porque o
    comportamento dele é consistente com `confirm`/`complete`, que também
    devolvem a linha crua — o contrato do front é que estava errado.
  - Removidos os filtros de "Área"/"Nível" na busca de mentor e a aba
    "Simulação de Entrevista com IA" (com "Analisar CV com IA") —
    nenhum dos dois tem campo ou endpoint correspondente no back; o
    checklist de CV e as dicas de entrevista continuam como conteúdo de
    referência estático (não são dado de usuário).
  - Lives: pergunta em Q&A e upvote testados de ponta a ponta na live
    seedada como `AO_VIVO`; removida a seção "Code Review Ao Vivo" do
    mock (100% fabricada, sem model no back).
- **7d (concluída)**: Planos, Assinatura, Pagamento (fluxo simulado), Indicação
  — sem mudança de back, só consumo real do que já existia (`plans`,
  `subscriptions`, `referrals` completos).
  - Assinatura/checkout/simulação de pagamento/cancelamento testados de
    ponta a ponta: assinar Pro → painel "Pagamento pendente" com o valor
    real → simular aprovação → card vira "Plano Atual" com botão de
    cancelar → cancelar reverte pro Gratuito. Tudo confirmado sobrevivendo
    a reload.
  - Removida a tabela "Comparativo de Funcionalidades" do mock — era uma
    matriz de booleans por funcionalidade que não existe no back (só há
    `features: string[]` por plano, já usado nos cards); os preços
    mensal/anual e a lista de benefícios por plano agora vêm 100% de
    `GET /api/plans`, sem nenhum item inventado.
  - Removido o botão "Falar com Vendas" (B2B) — não há endpoint de
    contato/lead; a seção ficou só como texto informativo.
  - **Indicação, com o loop completo testado**: `Planos.tsx` mostra
    código e link reais (`GET /api/referrals/me`); como
    `POST /api/referrals/claim` exige login e `Register.tsx` não
    autentica ninguém automaticamente, o código da URL (`?ref=`) é
    guardado no `localStorage` no cadastro e reivindicado uma vez pelo
    `Login.tsx` logo após o primeiro login (melhor esforço — erro de
    claim não bloqueia o login). Testado criando um usuário novo pelo
    link de indicação do `joaoteste`: após o primeiro login do indicado,
    o contador "Indicações" do `joaoteste` foi de 0 para 1.
- **Restante**: 7e (Admin).

## O que ainda falta para o front funcionar de ponta a ponta

Escopo restante da Fase 7 (7c, 7d, 7e acima). A base de autenticação já
está pronta pra suportar isso.
