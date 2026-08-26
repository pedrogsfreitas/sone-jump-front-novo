import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoadmapNodeStatus } from '../../generated/prisma/enums';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';

/** XP awarded per hour of estimated roadmap effort when a node is completed. */
const XP_PER_HOUR = 5;

export interface RoadmapNodeDto {
  id: string;
  name: string;
  category: string;
  hours: number;
  description: string;
  status: RoadmapNodeStatus;
  resources: Array<{ label: string; url: string | null }>;
}

export interface RoadmapCareerDto {
  id: string;
  slug: string;
  title: string;
}

export interface RoadmapDto {
  career: RoadmapCareerDto | null;
  nodes: RoadmapNodeDto[];
}

@Injectable()
export class RoadmapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async listForUser(userId: number): Promise<RoadmapDto> {
    const career = await this.currentCareer(userId);
    // Não ter escolhido carreira ainda não é erro — é um estado do produto. Devolver
    // 200 com a lista vazia deixa o front distinguir "escolha uma carreira" de "a API caiu".
    if (!career) return { career: null, nodes: [] };

    const [nodes, progress] = await Promise.all([
      this.prisma.roadmapNode.findMany({
        where: { careerId: career.id },
        orderBy: { orderIndex: 'asc' },
        include: {
          resources: { orderBy: { orderIndex: 'asc' } },
          prerequisites: { select: { prerequisiteNodeId: true } },
        },
      }),
      this.prisma.userRoadmapProgress.findMany({ where: { userId } }),
    ]);

    const savedStatus = new Map(progress.map((p) => [p.nodeId, p.status]));

    return {
      career,
      nodes: nodes.map((node) => ({
        id: node.id,
        name: node.name,
        category: node.category,
        hours: node.estimatedHours,
        description: node.description,
        status:
          savedStatus.get(node.id) ??
          this.deriveStatus(node.prerequisites, savedStatus),
        resources: node.resources.map((r) => ({ label: r.label, url: r.url })),
      })),
    };
  }

  async updateStatus(
    userId: number,
    nodeId: string,
    status: 'IN_PROGRESS' | 'COMPLETED',
  ): Promise<RoadmapDto> {
    const roadmap = await this.listForUser(userId);
    if (!roadmap.career) {
      throw new ConflictException(
        'Escolha uma carreira antes de avançar no roadmap.',
      );
    }

    // A lista já vem filtrada pela carreira do usuário, então um nó de outra carreira
    // simplesmente não existe daqui — é 404, não uma atualização silenciosa.
    const node = roadmap.nodes.find((n) => n.id === nodeId);
    if (!node) throw new NotFoundException('Etapa não encontrada.');

    if (node.status === RoadmapNodeStatus.LOCKED) {
      throw new ForbiddenException(
        'Etapa ainda bloqueada — conclua os pré-requisitos primeiro.',
      );
    }
    if (node.status === RoadmapNodeStatus.COMPLETED) {
      throw new ConflictException('Etapa já concluída.');
    }

    await this.prisma.userRoadmapProgress.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: {
        status,
        completedAt: status === RoadmapNodeStatus.COMPLETED ? new Date() : null,
      },
      create: {
        userId,
        nodeId,
        status,
        completedAt: status === RoadmapNodeStatus.COMPLETED ? new Date() : null,
      },
    });

    if (status === RoadmapNodeStatus.COMPLETED) {
      await this.xp.award(userId, node.hours * XP_PER_HOUR);
    }

    return this.listForUser(userId);
  }

  private async currentCareer(
    userId: number,
  ): Promise<RoadmapCareerDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { career: { select: { id: true, slug: true, title: true } } },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user.career;
  }

  /**
   * Nó sem progresso salvo só fica `AVAILABLE` quando **todos** os pré-requisitos
   * estiverem concluídos (pré-requisito é N:N desde a Fase 8a).
   *
   * Só o progresso salvo produz `COMPLETED` — a derivação nunca produz —, então basta
   * olhar `savedStatus` do pré-requisito. Isso torna o cálculo independente da ordem
   * em que os nós são percorridos, ao contrário da versão anterior, que dependia de o
   * `orderIndex` ser uma ordenação topológica.
   */
  private deriveStatus(
    prerequisites: Array<{ prerequisiteNodeId: string }>,
    savedStatus: Map<string, RoadmapNodeStatus>,
  ): RoadmapNodeStatus {
    const allDone = prerequisites.every(
      (p) =>
        savedStatus.get(p.prerequisiteNodeId) === RoadmapNodeStatus.COMPLETED,
    );
    return allDone ? RoadmapNodeStatus.AVAILABLE : RoadmapNodeStatus.LOCKED;
  }
}
