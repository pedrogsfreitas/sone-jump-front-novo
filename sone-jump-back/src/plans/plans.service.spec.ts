import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from './plans.service';

describe('PlansService.list', () => {
  /**
   * A tela de planos mostra os cartões na ordem em que vêm. Ordenar pelo preço aqui
   * é o que garante o "do mais barato ao mais caro" sem o front reordenar nada.
   */
  it('devolve os planos do mais barato para o mais caro', async () => {
    const prisma = {
      plan: {
        findMany: jest.fn(
          ({ orderBy }: { orderBy: Record<string, string> }) => {
            expect(orderBy).toEqual({ priceMonthlyCents: 'asc' });
            return Promise.resolve([
              { id: 1, name: 'Free', priceMonthlyCents: 0 },
              { id: 2, name: 'Pro', priceMonthlyCents: 2990 },
            ]);
          },
        ),
      },
    };
    const service = new PlansService(prisma as unknown as PrismaService);

    const planos = await service.list();

    expect(planos.map((p) => p.name)).toEqual(['Free', 'Pro']);
  });
});
