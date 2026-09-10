# Imagem do back-end (NestJS + Prisma).
#
# Base Debian slim, e não Alpine, de propósito: o `argon2` é módulo nativo e publica
# binários prontos para glibc. No Alpine (musl) ele teria que compilar do zero a cada
# build, exigindo toolchain de C na imagem.

# ---------- build ----------
FROM node:24-slim AS builder
WORKDIR /app

# Copiar só os manifestos antes do código aproveita o cache do Docker: enquanto as
# dependências não mudarem, esta camada não é reinstalada.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# O client do Prisma é gerado a partir do schema; não vem do npm nem do git.
RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
# `--ignore-scripts` evita que pacotes rodem post-install aqui; os binários nativos já
# vieram resolvidos pelo lockfile. `--omit=dev` deixa fora o CLI do Prisma, o Nest CLI
# e o Jest — as migrations são aplicadas pela pipeline, não pelo contêiner da API.
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma

# Usuário sem privilégios que já existe na imagem oficial do Node.
USER node

EXPOSE 8080
CMD ["node", "dist/src/main"]
