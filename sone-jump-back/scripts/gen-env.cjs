const fs = require('fs');
const path = require('path');
const c = require('crypto');

const content = [
  'DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"',
  'NODE_ENV=development',
  'PORT=8080',
  'CORS_ORIGIN=http://localhost:5173',
  '',
  'JWT_ACCESS_SECRET=' + c.randomBytes(48).toString('base64'),
  'JWT_ACCESS_TTL=15m',
  'JWT_REFRESH_SECRET=' + c.randomBytes(48).toString('base64'),
  'JWT_REFRESH_TTL_DAYS=30',
  'COOKIE_SECRET=' + c.randomBytes(32).toString('base64'),
  '',
  'CPF_HMAC_SECRET=' + c.randomBytes(32).toString('hex'),
  'CPF_ENC_KEY=' + c.randomBytes(32).toString('hex'),
  '',
].join('\n');

fs.writeFileSync(path.join(__dirname, '..', '.env'), content, 'utf8');
console.log('.env written,', content.length, 'bytes');
