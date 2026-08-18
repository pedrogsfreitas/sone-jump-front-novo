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

@Injectable()
export class RoadmapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async listForUser(userId: number): Promise<RoadmapNodeDto[]> {
    const [nodes, progress] = await Promise.all([
      this.prisma.roadmapNode.findMany({
        orderBy: { orderIndex: 'asc' },
        include: { resources: true },
      }),
      this.prisma.userRoadmapProgress.findMany({ where: { userId } }),
    ]);

    const savedStatus = new Map(progress.map((p) => [p.nodeId, p.status]));
    // Nodes with no saved progress derive their status from the prerequisite chain,
    // walked in orderIndex order (seeded so every prerequisite precedes its dependents).
    const effectiveStatus = new Map<string, RoadmapNodeStatus>();

    return nodes.map((node) => {
      let status = savedStatus.get(node.id);
      if (!status) {
        if (!node.prerequisiteNodeId) {
          status = RoadmapNodeStatus.AVAILABLE;
        } else {
          const prerequisiteStatus = effectiveStatus.get(
            node.prerequisiteNodeId,
          );
          status =
            prerequisiteStatus === RoadmapNodeStatus.COMPLETED
              ? RoadmapNodeStatus.AVAILABLE
              : RoadmapNodeStatus.LOCKED;
        }
      }
      effectiveStatus.set(node.id, status);

      return {
        id: node.id,
        name: node.name,
        category: node.category,
        hours: node.estimatedHours,
        description: node.description,
        status,
        resources: node.resources.map((r) => ({ label: r.label, url: r.url })),
      };
    });
  }

  async updateStatus(
    userId: number,
    nodeId: string,
    status: 'IN_PROGRESS' | 'COMPLETED',
  ): Promise<RoadmapNodeDto[]> {
    const nodes = await this.listForUser(userId);
    const node = nodes.find((n) => n.id === nodeId);
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
}
