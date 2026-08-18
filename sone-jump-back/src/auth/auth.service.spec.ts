import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hashCpf } from '../common/crypto/cpf.util';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const CPF_HMAC_SECRET = 'a'.repeat(64);
const CPF_ENC_KEY = 'b'.repeat(64);

interface MockUser {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  cpfHash: string;
  cpfEncrypted: string;
  phone: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
  active: boolean;
  xpTotal: number;
  level: number;
  lastAccessAt: Date | null;
}

type NewUserData = Omit<
  MockUser,
  'id' | 'role' | 'active' | 'xpTotal' | 'level' | 'lastAccessAt'
>;

function buildConfig(): ConfigService {
  const values: Record<string, unknown> = {
    CPF_HMAC_SECRET,
    CPF_ENC_KEY,
    JWT_REFRESH_TTL_DAYS: 30,
  };
  return { get: (key: string) => values[key] } as ConfigService;
}

function buildPrismaMock() {
  const users = new Map<number, MockUser>();
  let nextId = 1;

  const findByUniqueField = (where: {
    email?: string;
    username?: string;
    cpfHash?: string;
  }) =>
    [...users.values()].find(
      (u) =>
        (where.email && u.email === where.email) ||
        (where.username && u.username === where.username) ||
        (where.cpfHash && u.cpfHash === where.cpfHash),
    ) ?? null;

  const user = {
    findUnique: jest.fn(
      ({
        where,
      }: {
        where: { email?: string; username?: string; cpfHash?: string };
      }) => Promise.resolve(findByUniqueField(where)),
    ),
    findUniqueOrThrow: jest.fn(({ where }: { where: { id: number } }) => {
      const found = users.get(where.id);
      if (!found) throw new Error('not found');
      return Promise.resolve(found);
    }),
    create: jest.fn(({ data }: { data: NewUserData }) => {
      const created: MockUser = {
        id: nextId++,
        role: 'STUDENT',
        active: true,
        xpTotal: 0,
        level: 1,
        lastAccessAt: null,
        ...data,
      };
      users.set(created.id, created);
      return Promise.resolve(created);
    }),
    update: jest.fn(
      ({ where, data }: { where: { id: number }; data: Partial<MockUser> }) => {
        const found = users.get(where.id);
        if (!found) throw new Error('not found');
        Object.assign(found, data);
        return Promise.resolve(found);
      },
    ),
  };

  const refreshToken = {
    create: jest.fn(() => Promise.resolve({})),
    findUnique: jest.fn(() => Promise.resolve(null)),
    update: jest.fn(() => Promise.resolve({})),
    updateMany: jest.fn(() => Promise.resolve({ count: 0 })),
  };

  return { user, refreshToken, users };
}

function buildService(mock: ReturnType<typeof buildPrismaMock>) {
  const jwt = new JwtService({ secret: 'test-secret' });
  // A hand-rolled partial mock can't structurally satisfy Prisma's generated
  // PrismaService type, so this cast is the intentional seam between test double
  // and production type — narrower than sprinkling `any` through the assertions below.
  const prisma = mock as unknown as PrismaService;
  return new AuthService(prisma, jwt, buildConfig());
}

describe('AuthService', () => {
  it('registers a user with a hashed password and never stores the raw CPF', async () => {
    const mock = buildPrismaMock();
    const service = buildService(mock);

    const result = await service.register({
      email: 'ana@example.com',
      username: 'ana',
      password: 'senhaSegura123',
      fullname: 'Ana Souza',
      cpf: '52998224725',
      phone: '11988887777',
    });

    expect(result.id).toBe(1);
    const stored = mock.users.get(1)!;
    expect(stored.passwordHash).not.toContain('senhaSegura123');
    expect(stored.cpfEncrypted).not.toContain('52998224725');
    expect(stored.cpfHash).toBe(hashCpf('52998224725', CPF_HMAC_SECRET));
  });

  it('rejects registration with a duplicate email', async () => {
    const mock = buildPrismaMock();
    const service = buildService(mock);

    const dto = {
      email: 'ana@example.com',
      username: 'ana',
      password: 'senhaSegura123',
      fullname: 'Ana Souza',
      cpf: '52998224725',
      phone: '11988887777',
    };
    await service.register(dto);

    await expect(
      service.register({ ...dto, username: 'outra' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects login with a wrong password without revealing which field was wrong', async () => {
    const mock = buildPrismaMock();
    const service = buildService(mock);

    await service.register({
      email: 'ana@example.com',
      username: 'ana',
      password: 'senhaSegura123',
      fullname: 'Ana Souza',
      cpf: '52998224725',
      phone: '11988887777',
    });

    await expect(
      service.login({ username: 'ana', password: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.login({ username: 'nao-existe', password: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for a suspended (admin-deactivated) account', async () => {
    const mock = buildPrismaMock();
    const service = buildService(mock);

    await service.register({
      email: 'ana@example.com',
      username: 'ana',
      password: 'senhaSegura123',
      fullname: 'Ana Souza',
      cpf: '52998224725',
      phone: '11988887777',
    });
    mock.users.get(1)!.active = false;

    await expect(
      service.login({ username: 'ana', password: 'senhaSegura123' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('logs in successfully and issues an access token', async () => {
    const mock = buildPrismaMock();
    const service = buildService(mock);

    await service.register({
      email: 'ana@example.com',
      username: 'ana',
      password: 'senhaSegura123',
      fullname: 'Ana Souza',
      cpf: '52998224725',
      phone: '11988887777',
    });

    const result = await service.login({
      username: 'ana',
      password: 'senhaSegura123',
    });
    expect(result.id).toBe(1);
    expect(typeof result.accessToken).toBe('string');
    expect(result.refreshToken.raw).toHaveLength(64);
  });
});
