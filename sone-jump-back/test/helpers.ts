import { randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Sobe a aplicação com a mesma configuração do `main.ts` — prefixo, validação e filtro
 * de exceções. Sem o filtro, os testes veriam o formato de erro padrão do Nest, e não
 * o `{ message }` que o front realmente recebe.
 */
export async function createTestApp(): Promise<{
  app: INestApplication<App>;
  prisma: PrismaService;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();

  return { app, prisma: app.get(PrismaService) };
}

/** CPF válido no dígito verificador — o cadastro recusa qualquer outro. */
export function gerarCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const digito = (nums: number[]): number => {
    const peso = nums.length + 1;
    const soma = nums.reduce((acc, n, i) => acc + n * (peso - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const d1 = digito(base);
  const d2 = digito([...base, d1]);
  return [...base, d1, d2].join('');
}

export interface UsuarioE2E {
  id: number;
  username: string;
  token: string;
}

/** Cadastra um usuário novo e devolve o token de acesso dele. */
export async function registrarELogar(
  app: INestApplication<App>,
): Promise<UsuarioE2E> {
  const sufixo = randomUUID().slice(0, 8);
  const username = `e2e${sufixo}`;
  const senha = 'senhaSegura123';
  const server = app.getHttpServer();

  await request(server)
    .post('/api/login/register')
    .send({
      email: `e2e-${sufixo}@example.com`,
      username,
      password: senha,
      fullname: 'Usuário E2E',
      cpf: gerarCpf(),
      phone: '(11) 98888-7777',
    })
    .expect(201);

  const login = await request(server)
    .post('/api/login/authenticate')
    .send({ username, password: senha })
    .expect(200);

  const { id, token } = login.body as { id: number; token: string };
  return { id, username, token };
}

/**
 * Remove os usuários criados pelo teste. Quase tudo cai por cascade; o audit log é a
 * exceção de propósito — registro de ação administrativa não some junto com a conta
 * de quem a fez, então a FK segura a exclusão e o teste precisa limpá-lo antes.
 */
export async function limpar(
  prisma: PrismaService,
  usuarios: UsuarioE2E[],
): Promise<void> {
  const ids = usuarios.map((u) => u.id);
  await prisma.auditLog.deleteMany({ where: { adminUserId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

/** Data no formato `YYYY-MM-DD` no calendário de São Paulo, N dias atrás. */
export function diaSaoPaulo(diasAtras = 0): string {
  const agora = new Date(Date.now() - diasAtras * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora);
}
