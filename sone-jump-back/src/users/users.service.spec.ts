import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { OnboardingLevel } from '../../generated/prisma/enums';
import { encryptCpf } from '../common/crypto/cpf.util';
import { toDateColumn } from '../common/time/calendar';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

const CPF_ENC_KEY = 'b'.repeat(64);
const CPF = '52998224725';
const USER_ID = 1;
const SENHA_ATUAL = 'senhaSegura123';

interface MockUser {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  cpfEncrypted: string;
  phone: string;
  role: 'STUDENT' | 'ADMIN';
  bio: string | null;
  headline: string | null;
  location: string | null;
  avatarColor: string;
  focusMode: boolean;
  xpTotal: number;
  level: number;
  streakCurrentDays: number;
  streakLongestDays: number;
  lastStudyDate: Date | null;
  createdAt: Date;
  lastAccessAt: Date | null;
  emailVerifiedAt: Date | null;
  careerId: string | null;
  careerChosenAt: Date | null;
  experienceLevel: string | null;
  career: { id: string; slug: string; title: string } | null;
}

async function buildService(over: Partial<MockUser> = {}) {
  const user: MockUser = {
    id: USER_ID,
    email: 'ana@example.com',
    username: 'ana',
    passwordHash: await argon2.hash(SENHA_ATUAL, { type: argon2.argon2id }),
    fullName: 'Ana Souza',
    cpfEncrypted: encryptCpf(CPF, CPF_ENC_KEY),
    phone: '11988887777',
    role: 'STUDENT',
    bio: null,
    headline: null,
    location: null,
    avatarColor: 'purple',
    focusMode: false,
    xpTotal: 120,
    level: 2,
    streakCurrentDays: 4,
    streakLongestDays: 9,
    lastStudyDate: null,
    createdAt: new Date('2026-01-10T12:00:00.000Z'),
    lastAccessAt: null,
    emailVerifiedAt: null,
    careerId: null,
    careerChosenAt: null,
    experienceLevel: 'INTERMEDIARIO',
    career: null,
    ...over,
  };

  const usernamesTaken = new Set<string>();
  const revoked: unknown[] = [];

  const prisma = {
    user: {
      findUnique: jest.fn(() => Promise.resolve({ ...user })),
      findFirst: jest.fn(({ where }: { where: { username: string } }) =>
        Promise.resolve(usernamesTaken.has(where.username) ? { id: 2 } : null),
      ),
      update: jest.fn(({ data }: { data: Partial<MockUser> }) => {
        Object.assign(user, data);
        return Promise.resolve({ ...user });
      }),
    },
    career: {
      findFirst: jest.fn(
        ({ where }: { where: { slug: string; active: boolean } }) =>
          Promise.resolve(
            where.slug === 'front-end'
              ? { id: 'c1', slug: 'front-end', title: 'Front-end' }
              : null,
          ),
      ),
    },
    refreshToken: {
      updateMany: jest.fn((args: unknown) => {
        revoked.push(args);
        return Promise.resolve({ count: 2 });
      }),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  const config = {
    get: (key: string) => (key === 'CPF_ENC_KEY' ? CPF_ENC_KEY : undefined),
  } as ConfigService;

  return {
    service: new UsersService(prisma as unknown as PrismaService, config),
    user,
    usernamesTaken,
    revoked,
    prisma,
  };
}

describe('UsersService.findMe — o que sai do perfil', () => {
  it('mascara o CPF e nunca devolve hash de senha nem CPF cifrado', async () => {
    const { service } = await buildService();

    const perfil = await service.findMe(USER_ID);

    // Mostra só o miolo: os 3 primeiros e os 2 últimos dígitos ficam ocultos.
    expect(perfil.cpf).toBe('***.982.247-**');
    expect(JSON.stringify(perfil)).not.toContain('passwordHash');
    expect(JSON.stringify(perfil)).not.toContain(CPF);
  });

  it('e-mail não verificado vira booleano, não data', async () => {
    const { service } = await buildService({ emailVerifiedAt: null });
    expect((await service.findMe(USER_ID)).emailVerified).toBe(false);
  });

  it('sequência guardada expira na leitura quando o último estudo é antigo', async () => {
    const { service } = await buildService({
      streakCurrentDays: 4,
      lastStudyDate: new Date('2020-01-01T00:00:00.000Z'),
    });
    expect((await service.findMe(USER_ID)).streakCurrentDays).toBe(0);
  });

  it('sequência de quem estudou hoje é preservada', async () => {
    const hoje = toDateColumn(new Date().toISOString().slice(0, 10));
    const { service } = await buildService({
      streakCurrentDays: 4,
      lastStudyDate: hoje,
    });
    expect((await service.findMe(USER_ID)).streakCurrentDays).toBe(4);
  });
});

describe('UsersService.updateMe', () => {
  it('username já usado por outra pessoa é 409', async () => {
    const { service, usernamesTaken } = await buildService();
    usernamesTaken.add('ana2');

    await expect(
      service.updateMe(USER_ID, { username: 'ana2' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('atualiza o perfil quando o username está livre', async () => {
    const { service } = await buildService();
    const perfil = await service.updateMe(USER_ID, {
      username: 'ana2',
      bio: 'Estudando',
    });
    expect([perfil.username, perfil.bio]).toEqual(['ana2', 'Estudando']);
  });
});

describe('UsersService.setCareer', () => {
  it('carreira inexistente ou inativa é 404', async () => {
    const { service } = await buildService();
    await expect(
      service.setCareer(USER_ID, { careerSlug: 'nao-existe' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sem nível informado, o nível declarado antes é preservado', async () => {
    const { service, user } = await buildService({
      experienceLevel: 'INTERMEDIARIO',
    });

    await service.setCareer(USER_ID, { careerSlug: 'front-end' });

    expect(user.experienceLevel).toBe('INTERMEDIARIO');
    expect(user.careerId).toBe('c1');
  });

  it('com nível informado, sobrescreve', async () => {
    const { service, user } = await buildService({
      experienceLevel: OnboardingLevel.INICIANTE,
    });
    await service.setCareer(USER_ID, {
      careerSlug: 'front-end',
      level: OnboardingLevel.SENIOR,
    });
    expect(user.experienceLevel).toBe(OnboardingLevel.SENIOR);
  });
});

describe('UsersService.changePassword', () => {
  it('senha atual errada é 400 e não troca nada', async () => {
    const { service, user } = await buildService();
    const hashAntes = user.passwordHash;

    await expect(
      service.changePassword(USER_ID, {
        currentPassword: 'errada',
        newPassword: 'outraSenha123',
      }),
    ).rejects.toThrow('Senha atual incorreta.');
    expect(user.passwordHash).toBe(hashAntes);
  });

  it('repetir a senha atual é recusado — não revoga sessões à toa', async () => {
    const { service, revoked } = await buildService();

    await expect(
      service.changePassword(USER_ID, {
        currentPassword: SENHA_ATUAL,
        newPassword: SENHA_ATUAL,
      }),
    ).rejects.toThrow('A nova senha deve ser diferente da atual.');
    expect(revoked).toHaveLength(0);
  });

  it('troca a senha e derruba todas as sessões abertas', async () => {
    const { service, user, revoked } = await buildService();
    const hashAntes = user.passwordHash;

    await service.changePassword(USER_ID, {
      currentPassword: SENHA_ATUAL,
      newPassword: 'novaSenhaForte456',
    });

    expect(user.passwordHash).not.toBe(hashAntes);
    expect(await argon2.verify(user.passwordHash, 'novaSenhaForte456')).toBe(
      true,
    );
    // Uma troca motivada por suspeita de invasão não pode deixar sessão viva.
    expect(revoked).toHaveLength(1);
  });

  it('a troca e a revogação vão na mesma transação', async () => {
    const { service, prisma } = await buildService();

    await service.changePassword(USER_ID, {
      currentPassword: SENHA_ATUAL,
      newPassword: 'novaSenhaForte456',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
