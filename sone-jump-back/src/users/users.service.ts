import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../generated/prisma/client';
import { decryptCpf, maskCpf } from '../common/crypto/cpf.util';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findMe(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
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
    });
    return this.toSafeProfile(user);
  }

  /** Never return the password hash or the raw CPF material — only a masked CPF. */
  private toSafeProfile(user: User) {
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
      cpf: maskCpf(cpfPlain),
    };
  }
}
