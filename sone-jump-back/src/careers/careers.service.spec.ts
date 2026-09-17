import { PrismaService } from '../prisma/prisma.service';
import { CareersService } from './careers.service';

function buildService() {
  const prisma = { career: { findMany: jest.fn(() => Promise.resolve([])) } };
  return {
    service: new CareersService(prisma as unknown as PrismaService),
    prisma,
  };
}

describe('CareersService.list', () => {
  /**
   * A listagem alimenta a escolha de carreira do onboarding. Sem o filtro de ativas,
   * uma carreira retirada do ar voltaria a ser oferecida para novos usuários.
   */
  it('lista só carreiras ativas', async () => {
    const { service, prisma } = buildService();

    await service.list();

    expect(prisma.career.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true } }),
    );
  });

  it('ordena pelo índice definido no conteúdo, e não por id', async () => {
    const { service, prisma } = buildService();

    await service.list();

    expect(prisma.career.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      }),
    );
  });
});
