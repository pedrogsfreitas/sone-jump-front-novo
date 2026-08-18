import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MentorshipStatus } from '../../generated/prisma/enums';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmSessionDto } from './dto/confirm-session.dto';
import { CreateSessionDto } from './dto/create-session.dto';

/** Flat XP bonus for the mentee when a mentorship session is completed. */
const MENTORSHIP_XP = 50;

const MENTEE_SELECT = { fullName: true, avatarColor: true } as const;
const MENTOR_SELECT = {
  user: { select: { fullName: true, avatarColor: true } },
} as const;

@Injectable()
export class MentorshipSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async request(menteeId: number, dto: CreateSessionDto) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { userId: dto.mentorId },
    });
    if (!mentor) throw new NotFoundException('Mentor não encontrado.');
    if (mentor.userId === menteeId) {
      throw new ConflictException(
        'Você não pode solicitar mentoria consigo mesmo.',
      );
    }

    return this.prisma.mentorshipSession.create({
      data: {
        mentorId: mentor.userId,
        menteeId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes ?? 60,
        topic: dto.topic,
      },
    });
  }

  listAsMentee(userId: number) {
    return this.prisma.mentorshipSession.findMany({
      where: { menteeId: userId },
      include: { mentor: { select: MENTOR_SELECT } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  listAsMentor(mentorUserId: number) {
    return this.prisma.mentorshipSession.findMany({
      where: { mentorId: mentorUserId },
      include: { mentee: { select: MENTEE_SELECT } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async confirm(
    mentorUserId: number,
    sessionId: number,
    dto: ConfirmSessionDto,
  ) {
    const session = await this.assertMentorOwns(mentorUserId, sessionId);
    if (session.status !== MentorshipStatus.SOLICITADA) {
      throw new ConflictException(
        'Sessão não está mais aguardando confirmação.',
      );
    }
    return this.prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: { status: MentorshipStatus.CONFIRMADA, meetingUrl: dto.meetingUrl },
    });
  }

  async complete(mentorUserId: number, sessionId: number) {
    const session = await this.assertMentorOwns(mentorUserId, sessionId);
    if (session.status !== MentorshipStatus.CONFIRMADA) {
      throw new ConflictException(
        'Sessão precisa estar confirmada antes de concluir.',
      );
    }

    await this.prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: { status: MentorshipStatus.CONCLUIDA },
    });
    await this.prisma.mentor.update({
      where: { userId: mentorUserId },
      data: { sessionsCount: { increment: 1 } },
    });
    await this.xp.award(session.menteeId, MENTORSHIP_XP);

    return this.prisma.mentorshipSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
  }

  async cancel(userId: number, sessionId: number) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Sessão não encontrada.');
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw new ForbiddenException('Sessão não pertence a este usuário.');
    }
    if (session.status === MentorshipStatus.CONCLUIDA) {
      throw new ConflictException('Sessão já concluída.');
    }

    return this.prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: { status: MentorshipStatus.CANCELADA },
    });
  }

  private async assertMentorOwns(mentorUserId: number, sessionId: number) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Sessão não encontrada.');
    if (session.mentorId !== mentorUserId) {
      throw new ForbiddenException('Sessão não pertence a este mentor.');
    }
    return session;
  }
}
