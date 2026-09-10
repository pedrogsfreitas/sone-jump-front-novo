import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { User } from '../../generated/prisma/client';
import { decryptCpf, maskCpf } from '../common/crypto/cpf.util';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
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
      where: { slug: dto.careerSlug, active: true },
    });
    if (!career) {
      throw new NotFoundException('Carreira não encontrada ou indisponível.');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        careerId: career.id,
        careerChosenAt: new Date(),
        // Só sobrescreve quando veio um nível: a tela de escolha direta não pergunta
        // isso, e apagar o nível informado antes no quiz pioraria o roadmap em vez
        // de melhorar.
        ...(dto.level && { experienceLevel: dto.level }),
      },
      include: { career: CAREER_SUMMARY },
    });
    return this.toSafeProfile(user);
  }

  /**
   * Troca de senha por quem está logado e lembra a senha atual — o caminho normal,
   * distinto da recuperação por e-mail (que existe para quem NÃO lembra).
   *
   * Assim como a redefinição por e-mail, **encerra todas as sessões abertas**: se a
   * troca foi motivada por suspeita de acesso indevido, manter as sessões antigas
   * vivas anularia o efeito. A sessão atual também cai — o front reautentica.
   */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const currentOk = await argon2.verify(
      user.passwordHash,
      dto.currentPassword,
    );
    if (!currentOk) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    // Repetir a senha atual não é erro de segurança, mas é quase sempre engano do
    // usuário — e aceitar em silêncio revogaria as sessões dele por nada.
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da atual.',
      );
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
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
      // Booleano em vez da data: o front só precisa saber se mostra o aviso.
      emailVerified: user.emailVerifiedAt !== null,
      career: user.career,
      careerChosenAt: user.careerChosenAt,
      experienceLevel: user.experienceLevel,
      cpf: maskCpf(cpfPlain),
    };
  }
}
