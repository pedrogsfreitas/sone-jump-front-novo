import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  PlanKey,
  Role,
  SubscriptionStatus,
} from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { AdminUsersService } from './admin-users.service';
import { AdminUserStatusFilter } from './dto/list-admin-users.dto';

const ADMIN = 1;
const ALVO = 2;

interface MockUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  avatarColor: string;
  createdAt: Date;
  lastAccessAt: Date | null;
  subscriptions: Array<{
    plan: { key: PlanKey; name: string };
    status: SubscriptionStatus;
  }>;
}

function user(id: number, patch: Partial<MockUser> = {}): MockUser {
  return {
    id,
    username: `user${id}`,
    email: `user${id}@jump.local`,
    fullName: `Usuário ${id}`,
    role: Role.STUDENT,
    active: true,
    avatarColor: 'purple',
    createdAt: new Date('2026-09-01'),
    lastAccessAt: null,
    subscriptions: [],
    ...patch,
  };
}

/**
 * O mock aplica o `where` que o serviço monta — inclusive `subscriptions.some/none`.
 * É isso que permite testar o filtro de plano, cuja regra ("Grátis é a ausência de
 * assinatura ativa") vive justamente na forma desse `where`.
 */
function buildService(users: MockUser[] = []) {
  const rows = [...users];

  type Where = {
    OR?: Array<Record<string, { contains: string }>>;
    active?: boolean;
    subscriptions?: {
      some?: { status: SubscriptionStatus; plan?: { key: PlanKey } };
      none?: { status: SubscriptionStatus };
    };
  };

  const matches = (u: MockUser, where: Where = {}): boolean => {
    if (where.OR) {
      const termo = Object.values(where.OR[0])[0].contains.toLowerCase();
      // O serviço busca só em colunas de texto; listá-las explicitamente evita
      // comparar contra `subscriptions`, que é objeto.
      const CAMPOS_BUSCAVEIS = ['username', 'email', 'fullName'] as const;
      const casa = where.OR.some((clause) => {
        const campo = Object.keys(clause)[0];
        if (
          !CAMPOS_BUSCAVEIS.includes(campo as (typeof CAMPOS_BUSCAVEIS)[number])
        ) {
          throw new Error(`Busca em campo não textual: ${campo}`);
        }
        const valor = u[campo as (typeof CAMPOS_BUSCAVEIS)[number]];
        return valor.toLowerCase().includes(termo);
      });
      if (!casa) return false;
    }
    if (where.active !== undefined && u.active !== where.active) return false;
    if (where.subscriptions?.none) {
      if (u.subscriptions.some((s) => s.status === SubscriptionStatus.ATIVA))
        return false;
    }
    if (where.subscriptions?.some) {
      const alvo = where.subscriptions.some;
      const tem = u.subscriptions.some(
        (s) => s.status === alvo.status && s.plan.key === alvo.plan?.key,
      );
      if (!tem) return false;
    }
    return true;
  };

  const prisma = {
    user: {
      count: jest.fn(({ where }: { where?: Where } = {}) =>
        Promise.resolve(rows.filter((u) => matches(u, where)).length),
      ),
      findMany: jest.fn(
        ({
          where,
          take,
          skip,
        }: {
          where?: Where;
          take?: number;
          skip?: number;
        }) => {
          const filtrados = rows.filter((u) => matches(u, where));
          return Promise.resolve(
            filtrados.slice(skip ?? 0, (skip ?? 0) + (take ?? 20)),
          );
        },
      ),
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(rows.find((u) => u.id === where.id) ?? null),
      ),
      update: jest.fn(
        ({
          where,
          data,
          select,
        }: {
          where: { id: number };
          data: Partial<MockUser>;
          select?: Record<string, boolean>;
        }) => {
          const row = rows.find((u) => u.id === where.id)!;
          Object.assign(row, data);
          // O mock aplica o `select` como o Prisma faria. Sem isso, o teste de
          // vazamento passaria mesmo se o serviço parasse de restringir os campos —
          // e era exatamente esse o bug da Fase 6.
          if (!select) return Promise.resolve(row);
          const projetado = Object.fromEntries(
            Object.entries(select)
              .filter(([, incluir]) => incluir)
              .map(([campo]) => [campo, row[campo as keyof MockUser]]),
          );
          return Promise.resolve(projetado);
        },
      ),
    },
  };

  const auditLog = { record: jest.fn(() => Promise.resolve()) };
  const service = new AdminUsersService(
    prisma as unknown as PrismaService,
    auditLog as unknown as AuditLogService,
  );

  return { service, rows, auditLog };
}

describe('AdminUsersService — listagem paginada', () => {
  const doze = Array.from({ length: 12 }, (_, i) => user(i + 1));

  it('devolve a página pedida e o total do filtro inteiro', async () => {
    const { service } = buildService(doze);

    const pagina = await service.list({ limit: 5, offset: 0 });

    expect(pagina.items).toHaveLength(5);
    expect(pagina.total).toBe(12);
  });

  /** O total precisa contar a base toda, não a página — senão o rodapé mente. */
  it('a segunda página mantém o mesmo total', async () => {
    const { service } = buildService(doze);

    const pagina = await service.list({ limit: 5, offset: 5 });

    expect(pagina.items).toHaveLength(5);
    expect(pagina.total).toBe(12);
    expect(pagina.offset).toBe(5);
  });

  it('a última página vem incompleta, sem repetir itens', async () => {
    const { service } = buildService(doze);

    const pagina = await service.list({ limit: 5, offset: 10 });
    expect(pagina.items).toHaveLength(2);
  });
});

describe('AdminUsersService — filtros', () => {
  it('filtra por status e o total acompanha o filtro', async () => {
    const { service } = buildService([
      user(1),
      user(2, { active: false }),
      user(3, { active: false }),
    ]);

    const pagina = await service.list({
      status: AdminUserStatusFilter.INATIVO,
    });

    expect(pagina.items).toHaveLength(2);
    expect(pagina.total).toBe(2);
  });

  /** "Grátis" não é uma assinatura: é não ter nenhuma ativa. */
  it('plano FREE traz quem não tem assinatura ativa', async () => {
    const { service } = buildService([
      user(1),
      user(2, {
        subscriptions: [
          {
            status: SubscriptionStatus.ATIVA,
            plan: { key: PlanKey.PRO, name: 'Pro' },
          },
        ],
      }),
    ]);

    const pagina = await service.list({ plan: PlanKey.FREE });

    expect(pagina.total).toBe(1);
    expect(pagina.items[0].id).toBe(1);
    expect(pagina.items[0].plan).toBe(PlanKey.FREE);
  });

  it('plano PRO traz só quem tem assinatura ativa nesse plano', async () => {
    const { service } = buildService([
      user(1),
      user(2, {
        subscriptions: [
          {
            status: SubscriptionStatus.ATIVA,
            plan: { key: PlanKey.PRO, name: 'Pro' },
          },
        ],
      }),
    ]);

    const pagina = await service.list({ plan: PlanKey.PRO });

    expect(pagina.total).toBe(1);
    expect(pagina.items[0].id).toBe(2);
  });

  it('busca casa por nome, e-mail ou username', async () => {
    const { service } = buildService([
      user(1, { fullName: 'Maria Silva' }),
      user(2, { fullName: 'João Souza' }),
    ]);

    const pagina = await service.list({ search: 'maria' });
    expect(pagina.total).toBe(1);
  });
});

describe('AdminUsersService — ações administrativas', () => {
  it('promover a ADMIN registra no audit log', async () => {
    const { service, rows, auditLog } = buildService([
      user(ADMIN, { role: Role.ADMIN }),
      user(ALVO),
    ]);

    await service.updateRole(ADMIN, ALVO, Role.ADMIN);

    expect(rows[1].role).toBe(Role.ADMIN);
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'update_role',
      'User',
      ALVO,
      {
        role: Role.ADMIN,
      },
    );
  });

  /** Evita que um admin se tranque para fora da própria plataforma. */
  it('suspender a própria conta é 403', async () => {
    const { service, rows } = buildService([user(ADMIN, { role: Role.ADMIN })]);

    await expect(
      service.updateActive(ADMIN, ADMIN, false),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(rows[0].active).toBe(true);
  });

  it('reativar a própria conta é permitido', async () => {
    const { service, rows } = buildService([
      user(ADMIN, { role: Role.ADMIN, active: false }),
    ]);

    await service.updateActive(ADMIN, ADMIN, true);
    expect(rows[0].active).toBe(true);
  });

  it('agir sobre usuário inexistente é 404', async () => {
    const { service } = buildService([user(ADMIN, { role: Role.ADMIN })]);

    await expect(
      service.updateRole(ADMIN, 999, Role.MENTOR),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  /**
   * O bug encontrado na Fase 6: estas rotas devolviam a linha crua do Prisma, com
   * passwordHash e o CPF cifrado junto. O `select` explícito é o que impede a
   * regressão, e este teste é o que impede o `select` de voltar a sumir.
   */
  it('a resposta nunca inclui hash de senha nem CPF', async () => {
    const { service } = buildService([
      user(ADMIN, { role: Role.ADMIN }),
      user(ALVO),
    ]);

    const atualizado = await service.updateActive(ADMIN, ALVO, false);

    expect(Object.keys(atualizado).sort()).toEqual(
      [
        'active',
        'avatarColor',
        'email',
        'fullName',
        'id',
        'role',
        'username',
      ].sort(),
    );
  });
});
