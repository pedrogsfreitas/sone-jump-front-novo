import { PartnerStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from './partners.service';

function buildService() {
  const prisma = { partner: { findMany: jest.fn(() => Promise.resolve([])) } };
  return {
    service: new PartnersService(prisma as unknown as PrismaService),
    prisma,
  };
}

describe('PartnersService.list', () => {
  /** Parceiro em negociação ou encerrado não pode aparecer na vitrine pública. */
  it('mostra só parceiros ativos', async () => {
    const { service, prisma } = buildService();

    await service.list({ limit: 100, offset: 0 });

    expect(prisma.partner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: PartnerStatus.ATIVO } }),
    );
  });

  it('respeita limite e deslocamento da paginação', async () => {
    const { service, prisma } = buildService();

    await service.list({ limit: 10, offset: 20 });

    expect(prisma.partner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 20 }),
    );
  });
});
