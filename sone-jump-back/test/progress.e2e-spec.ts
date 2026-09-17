import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  diaSaoPaulo,
  limpar,
  registrarELogar,
  UsuarioE2E,
} from './helpers';

interface Sessao {
  id: number;
  occurredOn: string;
  durationMinutes: number;
}

interface Resumo {
  streakCurrentDays: number;
  sessionsThisWeek: number;
  sessionsByWeekday: number[];
  minutesThisMonth: number;
}

describe('Progresso (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let aluno: UsuarioE2E;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    aluno = await registrarELogar(app);
  });

  afterAll(async () => {
    await limpar(prisma, [aluno]);
    await app.close();
  });

  const auth = () => `Bearer ${aluno.token}`;

  it('registra sessão sem data e grava o dia de hoje em São Paulo', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/progress/sessions')
      .set('Authorization', auth())
      .send({ topic: 'Hooks do React', durationMinutes: 30 })
      .expect(201);

    // Entre 21h e meia-noite no Brasil, o dia UTC já é o seguinte: este era o bug.
    expect((res.body as Sessao).occurredOn).toContain(diaSaoPaulo(0));
  });

  it('aceita sessão retroativa dentro da janela de 3 dias', async () => {
    await request(app.getHttpServer())
      .post('/api/progress/sessions')
      .set('Authorization', auth())
      .send({
        topic: 'Revisão',
        durationMinutes: 20,
        occurredOn: diaSaoPaulo(1),
      })
      .expect(201);
  });

  it('recusa data futura', async () => {
    await request(app.getHttpServer())
      .post('/api/progress/sessions')
      .set('Authorization', auth())
      .send({
        topic: 'Viagem no tempo',
        durationMinutes: 10,
        occurredOn: diaSaoPaulo(-1),
      })
      .expect(400);
  });

  it('recusa data anterior à janela', async () => {
    await request(app.getHttpServer())
      .post('/api/progress/sessions')
      .set('Authorization', auth())
      .send({
        topic: 'Muito antiga',
        durationMinutes: 10,
        occurredOn: diaSaoPaulo(10),
      })
      .expect(400);
  });

  /**
   * A sessão de ontem foi registrada DEPOIS da de hoje. Com a sequência incrementada
   * a cada registro, isso zerava o contador; derivada dos dias estudados, não zera.
   */
  it('resumo traz sequência, minutos do mês e a semana calculados no servidor', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/progress/summary')
      .set('Authorization', auth())
      .expect(200);

    const resumo = res.body as Resumo;
    expect(resumo.streakCurrentDays).toBe(2);
    expect(resumo.minutesThisMonth).toBeGreaterThanOrEqual(30);
    expect(resumo.sessionsByWeekday).toHaveLength(7);
    expect(resumo.sessionsThisWeek).toBe(
      resumo.sessionsByWeekday.reduce((soma, n) => soma + n, 0),
    );
  });

  it('metas: criar, ajustar e apagar são do dono', async () => {
    const server = app.getHttpServer();
    const criada = await request(server)
      .post('/api/progress/goals')
      .set('Authorization', auth())
      .send({ title: 'Terminar o módulo de React' })
      .expect(201);
    const goalId = (criada.body as { id: number }).id;

    await request(server)
      .patch(`/api/progress/goals/${goalId}`)
      .set('Authorization', auth())
      .send({ currentPct: 50 })
      .expect(200);

    const outro = await registrarELogar(app);
    await request(server)
      .delete(`/api/progress/goals/${goalId}`)
      .set('Authorization', `Bearer ${outro.token}`)
      .expect(403);
    await limpar(prisma, [outro]);

    await request(server)
      .delete(`/api/progress/goals/${goalId}`)
      .set('Authorization', auth())
      .expect(200);
  });

  it('exige autenticação', async () => {
    await request(app.getHttpServer()).get('/api/progress/summary').expect(401);
  });
});
