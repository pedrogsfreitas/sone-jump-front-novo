import { randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface RegisterResponseBody {
  id: number;
  message: string;
}
interface AuthResponseBody {
  id: number;
  token: string;
}
interface ProfileResponseBody {
  email: string;
  cpf: string;
  bio: string;
  passwordHash?: string;
}
interface ErrorResponseBody {
  message: string;
}

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const suffix = randomUUID().slice(0, 8);
  const user = {
    email: `e2e-${suffix}@example.com`,
    username: `e2e${suffix}`,
    password: 'senhaSegura123',
    fullname: 'Usuário E2E',
    cpf: '529.982.247-25',
    phone: '(11) 98888-7777',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: user.username } });
    await app.close();
  });

  it('registers, logs in, refreshes and reads/updates the profile', async () => {
    const server = app.getHttpServer();

    const registerRes = await request(server)
      .post('/api/login/register')
      .send(user)
      .expect(201);
    const registerBody = registerRes.body as RegisterResponseBody;
    expect(typeof registerBody.id).toBe('number');
    expect(typeof registerBody.message).toBe('string');

    const loginRes = await request(server)
      .post('/api/login/authenticate')
      .send({ username: user.username, password: user.password })
      .expect(200);
    const loginBody = loginRes.body as AuthResponseBody;
    expect(loginBody.token).toEqual(expect.any(String));
    const refreshCookie = loginRes.headers['set-cookie']?.[0];
    expect(refreshCookie).toMatch(/^refresh_token=/);

    const accessToken = loginBody.token;

    const meRes = await request(server)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const meBody = meRes.body as ProfileResponseBody;
    expect(meBody.email).toBe(user.email);
    expect(meBody.cpf).toMatch(/^\*\*\*\.\d{3}\.\d{3}-\*\*$/);
    expect(meBody.passwordHash).toBeUndefined();

    await request(server).get('/api/users/me').expect(401);

    const patchRes = await request(server)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bio: 'Testando via e2e' })
      .expect(200);
    const patchBody = patchRes.body as ProfileResponseBody;
    expect(patchBody.bio).toBe('Testando via e2e');

    const refreshRes = await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(200);
    expect((refreshRes.body as AuthResponseBody).token).toEqual(
      expect.any(String),
    );

    // The rotated (old) cookie must now be rejected — reuse of a stale refresh
    // token is treated as theft and the whole session family is revoked.
    await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(401);
  });

  it('rejects duplicate registration with a specific email message and a generic CPF message', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/api/login/register')
      .send({ ...user, username: `${user.username}dup` })
      .expect(409)
      .expect((res) =>
        expect((res.body as ErrorResponseBody).message).toMatch(/e-mail/i),
      );

    await request(server)
      .post('/api/login/register')
      .send({
        ...user,
        username: `${user.username}cpf`,
        email: `other-${suffix}@example.com`,
      })
      .expect(409)
      .expect((res) =>
        expect((res.body as ErrorResponseBody).message).not.toMatch(/cpf/i),
      );
  });
});
