import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, limpar, registrarELogar, UsuarioE2E } from './helpers';

interface Desafio {
  id: number;
  completed: boolean;
  submissionUrl: string | null;
}

const LINK = 'https://github.com/aluno/desafio-e2e';

describe('Skills — conclusão de desafio (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let aluno: UsuarioE2E;
  let desafioId: number;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    aluno = await registrarELogar(app);

    const lista = await request(app.getHttpServer())
      .get('/api/skills/challenges')
      .set('Authorization', `Bearer ${aluno.token}`)
      .expect(200);
    const desafios = lista.body as Desafio[];
    if (desafios.length === 0) {
      throw new Error(
        'Nenhum desafio no banco: rode o seed antes do e2e (npm run db:seed).',
      );
    }
    desafioId = desafios[0].id;
  });

  afterAll(async () => {
    await limpar(prisma, [aluno]);
    await app.close();
  });

  const auth = () => `Bearer ${aluno.token}`;
  const concluir = (body: Record<string, string>) =>
    request(app.getHttpServer())
      .post(`/api/skills/challenges/${desafioId}/complete`)
      .set('Authorization', auth())
      .send(body);

  it('sem link, recusa', async () => {
    await concluir({}).expect(400);
  });

  it('link http é recusado, com mensagem em português', async () => {
    const res = await concluir({
      submissionUrl: 'http://github.com/a/b',
    }).expect(400);
    expect((res.body as { message: string }).message).toContain('https://');
  });

  it('texto que não é URL é recusado', async () => {
    await concluir({ submissionUrl: 'fiz no meu computador' }).expect(400);
  });

  it('com link https, conclui e guarda o link', async () => {
    const res = await concluir({ submissionUrl: LINK }).expect(201);
    expect(res.body).toMatchObject({ completed: true, submissionUrl: LINK });
  });

  it('a listagem devolve o link de quem concluiu', async () => {
    const lista = await request(app.getHttpServer())
      .get('/api/skills/challenges')
      .set('Authorization', auth())
      .expect(200);

    const desafio = (lista.body as Desafio[]).find((d) => d.id === desafioId)!;
    expect(desafio).toMatchObject({ completed: true, submissionUrl: LINK });
  });

  it('concluir de novo é 409 e não troca o link', async () => {
    await concluir({ submissionUrl: 'https://outro.dev/x' }).expect(409);

    const lista = await request(app.getHttpServer())
      .get('/api/skills/challenges')
      .set('Authorization', auth())
      .expect(200);
    const desafio = (lista.body as Desafio[]).find((d) => d.id === desafioId)!;
    expect(desafio.submissionUrl).toBe(LINK);
  });

  it('quem não concluiu vê submissionUrl nulo', async () => {
    const outro = await registrarELogar(app);
    const lista = await request(app.getHttpServer())
      .get('/api/skills/challenges')
      .set('Authorization', `Bearer ${outro.token}`)
      .expect(200);

    const desafio = (lista.body as Desafio[]).find((d) => d.id === desafioId)!;
    expect(desafio).toMatchObject({ completed: false, submissionUrl: null });

    await limpar(prisma, [outro]);
  });
});
