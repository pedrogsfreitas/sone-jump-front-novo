import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, limpar, registrarELogar, UsuarioE2E } from './helpers';

interface Grupo {
  id: number;
  joined: boolean;
}

interface Publicacao {
  id: number;
  groupId: number | null;
}

describe('Comunidade — feeds e grupos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let autor: UsuarioE2E;
  let leitor: UsuarioE2E;
  let grupoId: number;
  let postGeralId: number;
  let postGrupoId: number;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    [autor, leitor] = await Promise.all([
      registrarELogar(app),
      registrarELogar(app),
    ]);

    const grupos = await request(app.getHttpServer())
      .get('/api/community/groups')
      .set('Authorization', `Bearer ${autor.token}`)
      .expect(200);
    const lista = grupos.body as Grupo[];
    if (lista.length === 0) {
      throw new Error(
        'Nenhum grupo no banco: rode o seed antes do e2e (npm run db:seed).',
      );
    }
    grupoId = lista[0].id;
  });

  afterAll(async () => {
    await limpar(prisma, [autor, leitor]);
    await app.close();
  });

  const comoAutor = () => `Bearer ${autor.token}`;
  const comoLeitor = () => `Bearer ${leitor.token}`;

  it('publicar em grupo sem participar é 403', async () => {
    await request(app.getHttpServer())
      .post('/api/community/posts')
      .set('Authorization', comoAutor())
      .send({ content: 'tentando sem entrar', groupId: grupoId })
      .expect(403);
  });

  it('publicar em grupo inexistente é 404', async () => {
    await request(app.getHttpServer())
      .post('/api/community/posts')
      .set('Authorization', comoAutor())
      .send({ content: 'x', groupId: 999999 })
      .expect(404);
  });

  it('membro publica no grupo', async () => {
    const server = app.getHttpServer();
    await request(server)
      .put(`/api/community/groups/${grupoId}/join`)
      .set('Authorization', comoAutor())
      .expect(200);

    const res = await request(server)
      .post('/api/community/posts')
      .set('Authorization', comoAutor())
      .send({ content: 'publicação de grupo e2e', groupId: grupoId })
      .expect(201);

    const post = res.body as Publicacao;
    postGrupoId = post.id;
    expect(post.groupId).toBe(grupoId);
  });

  it('publicação sem grupo vai para o feed geral', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/community/posts')
      .set('Authorization', comoAutor())
      .send({ content: 'publicação geral e2e' })
      .expect(201);

    const post = res.body as Publicacao;
    postGeralId = post.id;
    expect(post.groupId).toBeNull();
  });

  it('feed geral não mostra publicação feita dentro de grupo', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/community/posts')
      .set('Authorization', comoLeitor())
      .expect(200);

    const ids = (res.body as Publicacao[]).map((p) => p.id);
    expect(ids).toContain(postGeralId);
    expect(ids).not.toContain(postGrupoId);
  });

  it('feed do grupo é legível por quem não participa', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/community/posts?groupId=${grupoId}`)
      .set('Authorization', comoLeitor())
      .expect(200);

    const ids = (res.body as Publicacao[]).map((p) => p.id);
    expect(ids).toContain(postGrupoId);
    expect(ids).not.toContain(postGeralId);
  });

  it('"Meus Posts" traz o que é meu, dentro e fora de grupos', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/community/posts?author=me')
      .set('Authorization', comoAutor())
      .expect(200);

    const ids = (res.body as Publicacao[]).map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining([postGeralId, postGrupoId]));
  });

  it('"Meus Posts" de outra pessoa não traz os meus', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/community/posts?author=me')
      .set('Authorization', comoLeitor())
      .expect(200);

    const ids = (res.body as Publicacao[]).map((p) => p.id);
    expect(ids).not.toContain(postGeralId);
  });

  it('author diferente de "me" é recusado', async () => {
    await request(app.getHttpServer())
      .get('/api/community/posts?author=7')
      .set('Authorization', comoAutor())
      .expect(400);
  });

  it('feed de grupo inexistente é 404', async () => {
    await request(app.getHttpServer())
      .get('/api/community/posts?groupId=999999')
      .set('Authorization', comoAutor())
      .expect(404);
  });

  it('apagar publicação de outra pessoa é 403', async () => {
    await request(app.getHttpServer())
      .delete(`/api/community/posts/${postGeralId}`)
      .set('Authorization', comoLeitor())
      .expect(403);
  });

  it('o autor apaga a própria publicação', async () => {
    await request(app.getHttpServer())
      .delete(`/api/community/posts/${postGeralId}`)
      .set('Authorization', comoAutor())
      .expect(200);
  });
});
