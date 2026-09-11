import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OnboardingLevel,
  RoadmapNodeStatus,
} from '../../generated/prisma/enums';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';

/** XP awarded per hour of estimated roadmap effort when a node is completed. */
const XP_PER_HOUR = 5;

/**
 * Fração de acertos exigida no quiz da etapa.
 *
 * Antes a aprovação exigia 100%. Com uma pergunta por etapa isso significava que
 * 25% das pessoas passavam no chute e quem errasse não tinha meio-termo — os dois
 * extremos ao mesmo tempo. Com um corte por nota e mais perguntas, o acaso deixa
 * de decidir e errar uma questão não anula o estudo.
 */
const APPROVAL_RATIO = 0.7;

/**
 * Quantos acertos aprovam, arredondando para cima. O `Math.min` protege o caso
 * degenerado: numa etapa com 1 ou 2 perguntas o corte viraria "todas certas", e é
 * melhor exigir uma a menos do que reintroduzir o 100% pela porta dos fundos.
 */
export function minimumToPass(total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.ceil(total * APPROVAL_RATIO), Math.max(1, total - 1));
}

/**
 * Quantas etapas iniciais o nível declarado dispensa de pré-requisito.
 *
 * Elas ficam `AVAILABLE`, nunca `COMPLETED`: nível é autodeclaração, e marcar como
 * concluído concederia XP (horas × 5) por preencher um formulário — o XP alimenta
 * nível, ranking e dashboard, então viraria mentira. O que a pessoa ganha é não ser
 * obrigada a passar pelo básico; o que ela não ganha é crédito por não ter feito.
 */
const UNLOCKED_BY_LEVEL: Record<OnboardingLevel, number> = {
  [OnboardingLevel.INICIANTE]: 0,
  [OnboardingLevel.BASICO]: 1,
  [OnboardingLevel.EXPERIENTE]: 2,
  [OnboardingLevel.SENIOR]: 3,
};

/** A alternativa correta nunca aparece aqui — ver `RoadmapNodeQuizOption` no schema. */
export interface RoadmapQuizOptionDto {
  id: string;
  text: string;
}

export interface RoadmapQuizQuestionDto {
  id: string;
  prompt: string;
  options: RoadmapQuizOptionDto[];
}

export interface RoadmapNodeDto {
  id: string;
  name: string;
  category: string;
  hours: number;
  description: string;
  status: RoadmapNodeStatus;
  resources: Array<{ label: string; url: string | null }>;
  quiz: RoadmapQuizQuestionDto[];
  studyConfirmed: boolean;
  quizPassed: boolean;
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        experienceLevel: true,
        career: { select: { id: true, slug: true, title: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    // Não ter escolhido carreira ainda não é erro — é um estado do produto. Devolver
    // 200 com a lista vazia deixa o front distinguir "escolha uma carreira" de "a API caiu".
    if (!user.career) return { career: null, nodes: [] };

    const [nodes, progress] = await Promise.all([
      this.prisma.roadmapNode.findMany({
        where: { careerId: user.career.id },
        orderBy: { orderIndex: 'asc' },
        include: {
          resources: { orderBy: { orderIndex: 'asc' } },
          prerequisites: { select: { prerequisiteNodeId: true } },
          quizQuestions: {
            orderBy: { orderIndex: 'asc' },
            include: {
              options: {
                orderBy: { orderIndex: 'asc' },
                // `correct` fica de fora deliberadamente: é o que impede a resposta
                // de vazar no DevTools.
                select: { id: true, text: true },
              },
            },
          },
        },
      }),
      this.prisma.userRoadmapProgress.findMany({ where: { userId } }),
    ]);

    const progressByNode = new Map(progress.map((p) => [p.nodeId, p]));
    const savedStatus = new Map(progress.map((p) => [p.nodeId, p.status]));
    const unlockedByLevel = user.experienceLevel
      ? UNLOCKED_BY_LEVEL[user.experienceLevel]
      : 0;

    return {
      career: user.career,
      nodes: nodes.map((node, index) => {
        const saved = progressByNode.get(node.id);
        return {
          id: node.id,
          name: node.name,
          category: node.category,
          hours: node.estimatedHours,
          description: node.description,
          status:
            saved?.status ??
            this.deriveStatus(
              node.prerequisites,
              savedStatus,
              index < unlockedByLevel,
            ),
          resources: node.resources.map((r) => ({
            label: r.label,
            url: r.url,
          })),
          quiz: node.quizQuestions.map((question) => ({
            id: question.id,
            prompt: question.prompt,
            options: question.options,
          })),
          // `!= null` cobre os dois casos de uma vez: sem linha de progresso e com
          // linha mas sem a data.
          studyConfirmed: saved?.studyConfirmedAt != null,
          quizPassed: saved?.quizPassedAt != null,
        };
      }),
    };
  }

  /**
   * Confirmação (autodeclarada) de que estudou o conteúdo da etapa. É metade do que
   * `updateStatus` exige para aceitar `COMPLETED`; a outra metade é o quiz.
   */
  async confirmStudy(userId: number, nodeId: string): Promise<RoadmapDto> {
    const node = await this.requireUnlockedNode(userId, nodeId);
    if (node.studyConfirmed) return this.listForUser(userId);

    await this.upsertProgress(userId, nodeId, {
      studyConfirmedAt: new Date(),
    });
    return this.listForUser(userId);
  }

  /**
   * Corrige o quiz da etapa **no servidor**. O cliente manda o que escolheu e recebe
   * apenas se passou — a alternativa correta nunca sai daqui.
   *
   * Exige acertar todas: o quiz é o portão para concluir a etapa, e um portão que
   * abre com metade das respostas certas não valida nada.
   */
  async gradeQuiz(
    userId: number,
    nodeId: string,
    answers: Record<string, string>,
  ): Promise<{
    passed: boolean;
    correctCount: number;
    total: number;
    minimumCorrect: number;
    roadmap: RoadmapDto;
  }> {
    await this.requireUnlockedNode(userId, nodeId);

    const questions = await this.prisma.roadmapNodeQuizQuestion.findMany({
      where: { nodeId },
      include: { options: { select: { id: true, correct: true } } },
    });
    if (questions.length === 0) {
      throw new ConflictException('Esta etapa não tem quiz de validação.');
    }

    const correctCount = questions.filter((question) => {
      const chosen = answers[question.id];
      return question.options.some((o) => o.id === chosen && o.correct);
    }).length;

    const minimumCorrect = minimumToPass(questions.length);
    const passed = correctCount >= minimumCorrect;

    if (passed) {
      await this.upsertProgress(userId, nodeId, { quizPassedAt: new Date() });
    }

    // A contagem volta para a tela sempre — inclusive na reprovação, que é quando
    // ela mais importa: sem saber quanto faltou, refazer o quiz vira tentativa às
    // cegas. Qual questão errou continua fora, senão a resposta certa vazaria por
    // eliminação em poucas tentativas.
    return {
      passed,
      correctCount,
      total: questions.length,
      minimumCorrect,
      roadmap: await this.listForUser(userId),
    };
  }

  async updateStatus(
    userId: number,
    nodeId: string,
    status: 'IN_PROGRESS' | 'COMPLETED',
  ): Promise<RoadmapDto> {
    const node = await this.requireUnlockedNode(userId, nodeId);

    if (node.status === RoadmapNodeStatus.COMPLETED) {
      throw new ConflictException('Etapa já concluída.');
    }

    if (status === RoadmapNodeStatus.COMPLETED) {
      if (!node.studyConfirmed) {
        throw new ForbiddenException(
          'Confirme que estudou o conteúdo antes de concluir a etapa.',
        );
      }
      // Nó sem quiz cadastrado não tem como ser aprovado nele — exigir aprovação aí
      // tornaria a etapa impossível de concluir.
      if (node.quiz.length > 0 && !node.quizPassed) {
        throw new ForbiddenException(
          'Acerte o quiz de validação antes de concluir a etapa.',
        );
      }
    }

    await this.upsertProgress(userId, nodeId, {
      status,
      completedAt: status === RoadmapNodeStatus.COMPLETED ? new Date() : null,
    });

    if (status === RoadmapNodeStatus.COMPLETED) {
      await this.xp.award(userId, node.hours * XP_PER_HOUR);
      await this.grantCertificationsFor(userId, nodeId);
    }

    return this.listForUser(userId);
  }

  /**
   * Concede a certificação da categoria quando o usuário conclui a **última** etapa
   * dela dentro da carreira.
   *
   * Antes nada no sistema criava `UserCertification`: a tela listava certificações que
   * ninguém podia conquistar, e o `earnedAt` — que alimenta o employability score —
   * ficava nulo para sempre. Derivar do roadmap evita um critério paralelo que
   * precisaria ser mantido em sincronia com o conteúdo.
   */
  private async grantCertificationsFor(
    userId: number,
    nodeId: string,
  ): Promise<void> {
    const node = await this.prisma.roadmapNode.findUnique({
      where: { id: nodeId },
      select: { careerId: true, category: true },
    });
    if (!node) return;

    const certification = await this.prisma.certification.findFirst({
      where: { careerId: node.careerId, category: node.category },
    });
    if (!certification) return;

    const [total, concluidos] = await Promise.all([
      this.prisma.roadmapNode.count({
        where: { careerId: node.careerId, category: node.category },
      }),
      this.prisma.userRoadmapProgress.count({
        where: {
          userId,
          status: RoadmapNodeStatus.COMPLETED,
          node: { careerId: node.careerId, category: node.category },
        },
      }),
    ]);
    if (concluidos < total) return;

    // `upsert` em vez de `create`: reconcluir uma etapa (depois de o conteúdo mudar,
    // por exemplo) não pode duplicar nem reescrever a data da conquista original.
    await this.prisma.userCertification.upsert({
      where: {
        userId_certificationId: { userId, certificationId: certification.id },
      },
      update: {},
      create: {
        userId,
        certificationId: certification.id,
        earnedAt: new Date(),
      },
    });
  }

  /**
   * Resolve o nó dentro do roadmap do usuário e garante que ele está acessível.
   *
   * A lista já vem filtrada pela carreira dele, então um nó de outra carreira
   * simplesmente não existe daqui — é 404, não uma atualização silenciosa.
   */
  private async requireUnlockedNode(
    userId: number,
    nodeId: string,
  ): Promise<RoadmapNodeDto> {
    const roadmap = await this.listForUser(userId);
    if (!roadmap.career) {
      throw new ConflictException(
        'Escolha uma carreira antes de avançar no roadmap.',
      );
    }

    const node = roadmap.nodes.find((n) => n.id === nodeId);
    if (!node) throw new NotFoundException('Etapa não encontrada.');

    if (node.status === RoadmapNodeStatus.LOCKED) {
      throw new ForbiddenException(
        'Etapa ainda bloqueada — conclua os pré-requisitos primeiro.',
      );
    }
    return node;
  }

  private upsertProgress(
    userId: number,
    nodeId: string,
    data: {
      status?: RoadmapNodeStatus | 'IN_PROGRESS' | 'COMPLETED';
      completedAt?: Date | null;
      studyConfirmedAt?: Date;
      quizPassedAt?: Date;
    },
  ) {
    return this.prisma.userRoadmapProgress.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: data,
      // Confirmar estudo ou passar no quiz antes de "iniciar" a etapa cria a linha de
      // progresso; `IN_PROGRESS` é o estado honesto nesse caso — a pessoa já mexeu nela.
      create: {
        userId,
        nodeId,
        status: RoadmapNodeStatus.IN_PROGRESS,
        ...data,
      },
    });
  }

  /**
   * Nó sem progresso salvo só fica `AVAILABLE` quando **todos** os pré-requisitos
   * estiverem concluídos — ou quando o nível declarado dispensa essa etapa.
   *
   * Só o progresso salvo produz `COMPLETED` — a derivação nunca produz —, então basta
   * olhar `savedStatus` do pré-requisito. Isso torna o cálculo independente da ordem
   * em que os nós são percorridos, ao contrário da versão anterior, que dependia de o
   * `orderIndex` ser uma ordenação topológica.
   */
  private deriveStatus(
    prerequisites: Array<{ prerequisiteNodeId: string }>,
    savedStatus: Map<string, RoadmapNodeStatus>,
    unlockedByLevel: boolean,
  ): RoadmapNodeStatus {
    if (unlockedByLevel) return RoadmapNodeStatus.AVAILABLE;

    const allDone = prerequisites.every(
      (p) =>
        savedStatus.get(p.prerequisiteNodeId) === RoadmapNodeStatus.COMPLETED,
    );
    return allDone ? RoadmapNodeStatus.AVAILABLE : RoadmapNodeStatus.LOCKED;
  }
}
