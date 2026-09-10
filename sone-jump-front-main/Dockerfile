# Imagem do front-end (React + Vite servido por nginx).

# ---------- build ----------
FROM node:24-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# O Vite substitui `import.meta.env.VITE_*` em tempo de BUILD, não de execução — então
# a URL da API precisa entrar aqui, não como variável do contêiner:
#   docker build --build-arg VITE_API_BASE_URL=https://api.exemplo.com .
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM nginx:1.29-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
