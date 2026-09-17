import { ConflictException } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { MentorsService } from './mentors.service';

const USER_ID = 1;

function buildService(jaEMentor = false) {
  const mentors = new Map<number, { userId: number }>();
  if (jaEMentor) mentors.set(USER_ID, { userId: USER_ID });
  const user = { id: USER_ID, role: Role.STUDENT as Role };
  const especialidades: number[] = [];

  const prisma = {
    mentor: {
      findUnique: jest.fn(({ where }: { where: { userId: number } }) =>
        Promise.resolve(mentors.get(where.userId) ?? null),
      ),
      findMany: jest.fn(() =>
        Promise.resolve([
          {
            userId: 2,
            companyName: 'ACME',
            ratingAvg: 4.8,
            sessionsCount: 12,
            hourlyPriceCents: 15000,
            currency: 'BRL',
            user: { fullName: 'Bia', avatarColor: 'blue', headline: 'Staff' },
            specialties: [{ skill: { name: 'React' } }],
          },
        ]),
      ),
      create: jest.fn(
        ({
          data,
        }: {
          data: {
            userId: number;
            specialties: { create: { skillId: number }[] };
          };
        }) => {
          mentors.set(data.userId, { userId: data.userId });
          especialidades.push(...data.specialties.create.map((s) => s.skillId));
          return Promise.resolve({ userId: data.userId });
        },
      ),
    },
    user: {
      update: jest.fn(({ data }: { data: { role: Role } }) => {
        user.role = data.role;
        return Promise.resolve({ ...user });
      }),
    },
  };

  return {
    service: new MentorsService(prisma as unknown as PrismaService),
    user,
    mentors,
    especialidades,
  };
}

describe('MentorsService.becomeMentor', () => {
  it('cria o perfil, guarda as especialidades e promove o usuário a MENTOR', async () => {
    const { service, user, mentors, especialidades } = buildService();

    const atualizado = await service.becomeMentor(USER_ID, {
      companyName: 'ACME',
      hourlyPriceCents: 12000,
      skillIds: [3, 5],
    });

    expect(mentors.has(USER_ID)).toBe(true);
    expect(especialidades).toEqual([3, 5]);
    expect(user.role).toBe(Role.MENTOR);
    expect(atualizado.role).toBe(Role.MENTOR);
  });

  it('virar mentor duas vezes é 409 e não mexe no papel', async () => {
    const { service, user } = buildService(true);

    await expect(
      service.becomeMentor(USER_ID, {
        companyName: 'ACME',
        hourlyPriceCents: 1,
        skillIds: [],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(user.role).toBe(Role.STUDENT);
  });
});

describe('MentorsService.list', () => {
  it('achata o mentor para o formato que a tela usa', async () => {
    const { service } = buildService();

    const [mentor] = await service.list({ limit: 100, offset: 0 });

    expect(mentor).toMatchObject({
      userId: 2,
      name: 'Bia',
      specialties: ['React'],
      rating: 4.8,
    });
  });
});
