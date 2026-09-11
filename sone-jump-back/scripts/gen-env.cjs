/**
 * Gera o .env do back-end com segredos aleatórios.
 *
 *   node scripts/gen-env.cjs "<DATABASE_URL>"
 *
 * Recusa sobrescrever um .env existente. Isso é proposital: CPF_HMAC_SECRET e
 * CPF_ENC_KEY precisam ser IGUAIS em todas as máquinas que compartilham o mesmo
 * banco — regerá-los torna ilegíveis os CPFs já gravados por outra pessoa. Quem
 * entra no projeto deve copiar o .env de quem já tem, não gerar um novo.
 */
const fs = require('fs');
const path = require('path');
const c = require('crypto');

const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  console.error(
    'Abortado: .env já existe.\n' +
      'Este script nunca sobrescreve — os segredos de CPF são compartilhados entre\n' +
      'as máquinas do time e regerá-los quebraria os dados já gravados.\n' +
      'Precisa mesmo recriar? Apague o .env manualmente antes.',
  );
  process.exit(1);
}

const databaseUrl = process.argv[2];
if (!databaseUrl) {
  console.error(
    'Abortado: falta a DATABASE_URL.\n\n' +
      '  node scripts/gen-env.cjs "postgresql://usuario:senha@host/banco?sslmode=require"\n\n' +
      'Pegue a string de conexão DIRETA (host sem "-pooler") no painel do Neon.',
  );
  process.exit(1);
}

const content = [
  // Sem aspas de proposito: o `dotenv` do Node as remove, mas o `env_file` do
  // Docker nao — ele passaria a aspa como parte da string de conexao e o
  // `docker compose up` falharia com erro de conexao dificil de diagnosticar.
  `DATABASE_URL=${databaseUrl}`,
  '',
  'NODE_ENV=development',
  'PORT=8080',
  '# Precisa bater com a origem onde o front é servido em dev.',
  'CORS_ORIGIN=http://localhost:5173',
  '',
  'JWT_ACCESS_SECRET=' + c.randomBytes(48).toString('base64'),
  'JWT_ACCESS_TTL=15m',
  'JWT_REFRESH_SECRET=' + c.randomBytes(48).toString('base64'),
  'JWT_REFRESH_TTL_DAYS=30',
  'COOKIE_SECRET=' + c.randomBytes(32).toString('base64'),
  '',
  '# Hash (HMAC-SHA256) e cifra (AES-256-GCM) do CPF em repouso. 32 bytes em hex.',
  'CPF_HMAC_SECRET=' + c.randomBytes(32).toString('hex'),
  'CPF_ENC_KEY=' + c.randomBytes(32).toString('hex'),
  '',
].join('\n');

fs.writeFileSync(envPath, content, 'utf8');
console.log('.env criado. Não commite este arquivo.');
