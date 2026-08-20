import { ConflictException } from '@nestjs/common';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioProjectDto } from './dto/create-portfolio-project.dto';
import { SkillsService } from './skills.service';

const USER_ID = 1;

interface MockProject {
  id: number;
  userId: number;
  title: string;
  stackTags: string[];
}

function buildService() {
  const projects: MockProject[] = [];
  let nextId = 1;

  const prisma = {
    portfolioProject: {
      count: jest.fn(({ where }: { where: { userId: number } }) =>
        Promise.resolve(
          projects.filter((p) => p.userId === where.userId).length,
        ),
      ),
      create: jest.fn(({ data }: { data: Omit<MockProject, 'id'> }) => {
        const created = { id: nextId++, ...data };
        projects.push(created);
        return Promise.resolve(created);
      }),
    },
  };

  const xp = { award: jest.fn(() => Promise.resolve()) };
  const service = new SkillsService(
    prisma as unknown as PrismaService,
    xp as unknown as XpService,
  );

  return { service, projects, raw: prisma };
}

function dto(title: string): CreatePortfolioProjectDto {
  return { title, stackTags: ['ts'] };
}

async function fill(
  service: SkillsService,
  n: number,
  userId = USER_ID,
): Promise<void> {
  for (let i = 1; i <= n; i++) {
    await service.createPortfolioProject(userId, dto(`Projeto ${i}`));
  }
}

describe('SkillsService.createPortfolioProject — teto de 20 projetos', () => {
  it('cria um projeto dentro do cap', async () => {
    const { service, projects } = buildService();
    const created = await service.createPortfolioProject(
      USER_ID,
      dto('Meu app'),
    );

    expect(created.title).toBe('Meu app');
    expect(projects).toHaveLength(1);
  });

  it('aceita exatamente o 20º projeto (borda)', async () => {
    const { service, projects } = buildService();
    await fill(service, 19);

    const vigesimo = await service.createPortfolioProject(
      USER_ID,
      dto('Projeto 20'),
    );

    expect(vigesimo.title).toBe('Projeto 20');
    expect(projects).toHaveLength(20);
  });

  it('rejeita o 21º projeto (borda)', async () => {
    const { service, projects, raw } = buildService();
    await fill(service, 20);

    await expect(
      service.createPortfolioProject(USER_ID, dto('Projeto 21')),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(projects).toHaveLength(20);
    expect(raw.portfolioProject.create).toHaveBeenCalledTimes(20);
  });

  it('erro traz mensagem em português com o limite', async () => {
    const { service } = buildService();
    await fill(service, 20);

    await expect(
      service.createPortfolioProject(USER_ID, dto('Projeto 21')),
    ).rejects.toThrow('Limite de 20 projetos no portfólio atingido.');
  });

  it('ataque: 30 criações em sequência param em 20', async () => {
    const { service, projects } = buildService();
    let aceitas = 0;
    let rejeitadas = 0;

    for (let i = 1; i <= 30; i++) {
      try {
        await service.createPortfolioProject(USER_ID, dto(`Spam ${i}`));
        aceitas++;
      } catch {
        rejeitadas++;
      }
    }

    expect(aceitas).toBe(20);
    expect(rejeitadas).toBe(10);
    expect(projects).toHaveLength(20);
  });

  it('o cap é por usuário — outro usuário não é afetado', async () => {
    const { service, projects } = buildService();
    await fill(service, 20);

    await expect(
      service.createPortfolioProject(2, dto('Projeto de outro')),
    ).resolves.toBeDefined();
    expect(projects).toHaveLength(21);
  });
});
