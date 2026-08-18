import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLiveDto } from './dto/create-live.dto';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class LivesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.liveSession.findMany({
      include: { host: { select: { fullName: true, avatarColor: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  listRecordings() {
    return this.prisma.recording.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(hostId: number, dto: CreateLiveDto) {
    return this.prisma.liveSession.create({
      data: {
        hostId,
        title: dto.title,
        scheduledAt: new Date(dto.scheduledAt),
        topics: dto.topics ?? [],
      },
    });
  }

  async updateStatus(
    userId: number,
    isAdmin: boolean,
    liveId: number,
    status: 'AO_VIVO' | 'ENCERRADA',
  ) {
    const live = await this.assertExists(liveId);
    if (live.hostId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Apenas o host (ou um admin) pode alterar esta live.',
      );
    }
    return this.prisma.liveSession.update({
      where: { id: liveId },
      data: { status },
    });
  }

  async listQuestions(liveId: number) {
    await this.assertExists(liveId);
    return this.prisma.liveQuestion.findMany({
      where: { liveSessionId: liveId },
      include: { user: { select: { username: true } } },
      orderBy: { votes: 'desc' },
    });
  }

  async addQuestion(userId: number, liveId: number, dto: CreateQuestionDto) {
    await this.assertExists(liveId);
    return this.prisma.liveQuestion.create({
      data: { liveSessionId: liveId, userId, text: dto.text },
      include: { user: { select: { username: true } } },
    });
  }

  async upvote(userId: number, questionId: number) {
    const question = await this.prisma.liveQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Pergunta não encontrada.');

    const already = await this.prisma.liveQuestionVote.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    if (already) throw new ConflictException('Você já votou nesta pergunta.');

    const [, updated] = await this.prisma.$transaction([
      this.prisma.liveQuestionVote.create({ data: { userId, questionId } }),
      this.prisma.liveQuestion.update({
        where: { id: questionId },
        data: { votes: { increment: 1 } },
      }),
    ]);
    return updated;
  }

  private async assertExists(liveId: number) {
    const live = await this.prisma.liveSession.findUnique({
      where: { id: liveId },
    });
    if (!live) throw new NotFoundException('Live não encontrada.');
    return live;
  }
}
