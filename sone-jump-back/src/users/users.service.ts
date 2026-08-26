import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../generated/prisma/client';
import { decryptCpf, maskCpf } from '../common/crypto/cpf.util';
import { PrismaService } from '../prisma/prisma.service';
import { SetCareerDto } from './dto/set-career.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** Só o suficiente para o front saber qual roadmap o usuário está percorrendo. */
export interface CareerSummary {
  id: string;
  slug: string;
  title: string;
}

const CAREER_SUMMARY = {
  select: { id: true, slug: true, title: true },
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { career: CAREER_SUMMARY },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return this.toSafeProfile(user);
  }

  async updateMe(userId: number, dto: UpdateProfileDto) {
    if (dto.username) {
      const taken = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id: userId } },
      });
      if (taken) throw new ConflictException('Nome de usuário já em uso.');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: { career: CAREER_SUMMARY },
    });
    return this.toSafeProfile(user);
  }

  /**
   * Escolher/trocar de carreira. Não mexe em `UserRoadmapProgress`: como os nós são
   * cópias por carreira, o progresso da carreira anterior continua guardado e volta
   * intacto se o usuário retornar a ela.
   */
  async setCareer(userId: number, dto: SetCareerDto) {
    const career = await this.prisma.career.findFirst({
      where: { id: dto.careerId, active: true },
    });
    if (!career) {
      throw new NotFoundException('Carreira não encontrada ou indisponível.');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { careerId: career.id, careerChosenAt: new Date() },
      include: { career: CAREER_SUMMARY },
    });
    return this.toSafeProfile(user);
  }

  /** Never return the password hash or the raw CPF material — only a masked CPF. */
  private toSafeProfile(user: User & { career: CareerSummary | null }) {
    const cpfPlain = decryptCpf(
      user.cpfEncrypted,
      this.config.get<string>('CPF_ENC_KEY')!,
    );
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      bio: user.bio,
      headline: user.headline,
      location: user.location,
      avatarColor: user.avatarColor,
      focusMode: user.focusMode,
      xpTotal: user.xpTotal,
      level: user.level,
      streakCurrentDays: user.streakCurrentDays,
      streakLongestDays: user.streakLongestDays,
      createdAt: user.createdAt,
      lastAccessAt: user.lastAccessAt,
      career: user.career,
      careerChosenAt: user.careerChosenAt,
      cpf: maskCpf(cpfPlain),
    };
  }
}
