import { randomUUID } from 'crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, limpar, registrarELogar, UsuarioE2E } from './helpers';

interface Grupo {
  id: number;
  name: string;
  icon: string | null;
  membersCount: number;
  postsCount: number;
}

describe('Admin — grupos da comunidade (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let admin: UsuarioE2E;
  let aluno: UsuarioE2E;
  const nome = `Grupo E2E ${randomUUID().slice(0, 6)}`;
  let grupoId: number;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    [admin, aluno] = await Promise.all([
      registrarELogar(app),
      registrarELogar(app),
    ]);

    // O cadastro sempre cria STUDENT; promover direto no banco é mais honesto do que
    // expor uma rota de "virar admin" só para o teste existir.
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: Role.ADMIN },
    });
    const login = await request(app.getHttpServer())
      .post('/api/login/authenticate')
      .send({ username: admin.username, password: 'senhaSegura123' })
      .expect(200);
    admin.token = (login.body as { token: string }).token;
  });

  afterAll(async () => {
    await prisma.group.deleteMany({
      where: { name: { startsWith: 'Grupo E2E' } },
    });
    await limpar(prisma, [admin, aluno]);
    await app.close();
  });

  const comoAdmin = () => `Bearer ${admin.token}`;

  it('aluno comum não acessa a administração de grupos', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/groups')
      .set('Authorization', `Bearer ${aluno.token}`)
      .expect(403);
  });

  it('admin cria o grupo', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/groups')
      .set('Authorization', comoAdmin())
      .send({ name: nome, icon: '🧪' })
      .expect(201);

    grupoId = (res.body as Grupo).id;
    expect(res.body).toMatchObject({ name: nome, icon: '🧪' });
  });

  it('nome repetido é 409', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/groups')
      .set('Authorization', comoAdmin())
      .send({ name: nome })
      .expect(409);
  });

  it('a listagem traz contagem de membros e publicações', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/groups')
      .set('Authorization', comoAdmin())
      .expect(200);

    const grupo = (res.body as Grupo[]).find((g) => g.id === grupoId)!;
    expect(grupo).toMatchObject({ membersCount: 0, postsCount: 0 });
  });

  it('o grupo criado aparece para os alunos na comunidade', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/community/groups')
      .set('Authorization', `Bearer ${aluno.token}`)
      .expect(200);

    expect((res.body as Grupo[]).some((g) => g.id === grupoId)).toBe(true);
  });

  it('admin renomeia o grupo', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/groups/${grupoId}`)
      .set('Authorization', comoAdmin())
      .send({ name: `${nome} renomeado` })
      .expect(200);

    expect((res.body as Grupo).name).toBe(`${nome} renomeado`);
  });

  /** Apagar é cascade: sem essa trava, publicações de alunos sumiriam sem aviso. */
  it('grupo com publicação não pode ser apagado', async () => {
    const server = app.getHttpServer();
    await request(server)
      .put(`/api/community/groups/${grupoId}/join`)
      .set('Authorization', `Bearer ${aluno.token}`)
      .expect(200);
    await request(server)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${aluno.token}`)
      .send({ content: 'publicação que segura o grupo', groupId: grupoId })
      .expect(201);

    const res = await request(server)
      .delete(`/api/admin/groups/${grupoId}`)
      .set('Authorization', comoAdmin())
      .expect(409);

    expect((res.body as { message: string }).message).toContain('publicação');
  });

  it('depois de esvaziar, o grupo é apagado', async () => {
    await prisma.post.deleteMany({ where: { groupId: grupoId } });

    await request(app.getHttpServer())
      .delete(`/api/admin/groups/${grupoId}`)
      .set('Authorization', comoAdmin())
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/admin/groups/${grupoId}`)
      .set('Authorization', comoAdmin())
      .send({ name: 'sumiu' })
      .expect(404);
  });
});
