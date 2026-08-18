import { ConflictException, Injectable } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { BecomeMentorDto } from './dto/become-mentor.dto';

const SAFE_USER_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  role: true,
  active: true,
  avatarColor: true,
} as const;

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const mentors = await this.prisma.mentor.findMany({
      include: {
        user: { select: { fullName: true, avatarColor: true, headline: true } },
        specialties: { include: { skill: true } },
      },
      orderBy: { ratingAvg: 'desc' },
    });

    return mentors.map((mentor) => ({
      userId: mentor.userId,
      name: mentor.user.fullName,
      avatarColor: mentor.user.avatarColor,
      headline: mentor.user.headline,
      companyName: mentor.companyName,
      specialties: mentor.specialties.map((s) => s.skill.name),
      rating: mentor.ratingAvg,
      sessionsCount: mentor.sessionsCount,
      hourlyPriceCents: mentor.hourlyPriceCents,
      currency: mentor.currency,
    }));
  }

  async becomeMentor(userId: number, dto: BecomeMentorDto) {
    const existing = await this.prisma.mentor.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Você já é mentor.');

    await this.prisma.mentor.create({
      data: {
        userId,
        companyName: dto.companyName,
        hourlyPriceCents: dto.hourlyPriceCents,
        specialties: { create: dto.skillIds.map((skillId) => ({ skillId })) },
      },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.MENTOR },
      select: SAFE_USER_SELECT,
    });
  }
}
