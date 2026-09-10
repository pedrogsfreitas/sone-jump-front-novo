import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Um perfil de onboarding por usuário (`userId` é a PK), então repetir o
   * questionário sobrescreve a resposta anterior em vez de acumular linhas.
   *
   * Salvar aqui NÃO troca a carreira do usuário: `User.careerId` é a escolha efetiva
   * e vive em `PUT /api/users/me/career`. Esta tabela guarda o que foi respondido no
   * questionário, que a pessoa pode contrariar depois sem perder o histórico.
   */
  async save(userId: number, dto: SaveOnboardingDto) {
    const career = dto.careerSlug
      ? await this.prisma.career.findUnique({
          where: { slug: dto.careerSlug },
          select: { id: true },
        })
      : null;

    const data = {
      goal: dto.goal,
      area: dto.area,
      level: dto.level,
      weeklyTime: dto.weeklyTime,
      careerId: career?.id ?? null,
    };

    return this.prisma.onboardingProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  find(userId: number) {
    return this.prisma.onboardingProfile.findUnique({ where: { userId } });
  }
}
