import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { Role } from '../../generated/prisma/enums';
import { encryptCpf, hashCpf } from '../common/crypto/cpf.util';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface IssuedRefreshToken {
  raw: string;
  hash: string;
  expiresAt: Date;
}

function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const [emailTaken, usernameTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findUnique({ where: { username: dto.username } }),
    ]);
    if (emailTaken) throw new ConflictException('E-mail já cadastrado.');
    if (usernameTaken)
      throw new ConflictException('Nome de usuário já em uso.');

    const cpfHash = hashCpf(
      dto.cpf,
      this.config.get<string>('CPF_HMAC_SECRET')!,
    );
    const cpfTaken = await this.prisma.user.findUnique({ where: { cpfHash } });
    // Deliberately generic: confirming *specifically* that the CPF is duplicated would let
    // this endpoint be used to check whether a given national ID has an account here.
    if (cpfTaken) {
      throw new ConflictException(
        'Não foi possível concluir o cadastro com os dados informados.',
      );
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    const cpfEncrypted = encryptCpf(
      dto.cpf,
      this.config.get<string>('CPF_ENC_KEY')!,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        fullName: dto.fullname,
        cpfHash,
        cpfEncrypted,
        phone: dto.phone,
      },
    });

    return { id: user.id, message: 'Cadastro realizado com sucesso.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    // Same error whether the username doesn't exist or the password is wrong, so this
    // endpoint can't be used to enumerate valid usernames.
    const invalidCredentials = () =>
      new UnauthorizedException('Credenciais inválidas.');
    if (!user) throw invalidCredentials();

    const passwordOk = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordOk) throw invalidCredentials();

    if (!user.active) throw new ForbiddenException('Esta conta foi suspensa.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastAccessAt: new Date() },
    });

    const accessToken = this.signAccessToken(user.id, user.role);
    const refreshToken = await this.issueRefreshToken(user.id);
    return { id: user.id, accessToken, refreshToken };
  }

  async refresh(rawToken: string) {
    const hash = hashRefreshToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
    });
    if (!existing) throw new UnauthorizedException('Sessão inválida.');

    if (existing.revokedAt) {
      // A revoked/already-rotated token being presented again is a strong signal it was
      // stolen and replayed. Respond by killing every active session for this user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Sessão inválida.');
    }

    if (existing.expiresAt < new Date())
      throw new UnauthorizedException('Sessão expirada.');

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: existing.userId },
    });
    const refreshToken = await this.issueRefreshToken(user.id);
    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedByTokenHash: refreshToken.hash },
    });

    const accessToken = this.signAccessToken(user.id, user.role);
    return { id: user.id, accessToken, refreshToken };
  }

  async logout(rawToken: string | undefined) {
    if (!rawToken) return;
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private signAccessToken(userId: number, role: Role): string {
    return this.jwt.sign({ sub: userId, role });
  }

  private async issueRefreshToken(userId: number): Promise<IssuedRefreshToken> {
    const raw = randomBytes(48).toString('base64url');
    const hash = hashRefreshToken(raw);
    const ttlDays = this.config.get<number>('JWT_REFRESH_TTL_DAYS')!;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: hash, expiresAt },
    });
    return { raw, hash, expiresAt };
  }
}
