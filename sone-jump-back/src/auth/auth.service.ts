import {
  BadRequestException,
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
import { MailService } from '../common/mail/mail.service';
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

/** Mesmo esquema do refresh token: o banco nunca guarda o valor que foi enviado. */
function hashResetToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Curto de propósito: é um link de uso único que chega por e-mail. */
const RESET_TTL_MINUTES = 30;

/** Mais folgado que o de senha: confirmar e-mail não é urgente nem sensível. */
const EMAIL_VERIFICATION_TTL_HOURS = 24;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
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

    // Melhor esforço: falha no envio não pode impedir o cadastro de concluir — a
    // pessoa pode pedir o link de novo depois de entrar.
    await this.sendEmailVerification(user.id).catch(() => {});

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

  /**
   * Dispara (ou redispara) a confirmação de e-mail.
   *
   * **A conta funciona sem confirmar.** É uma decisão de produto: bloquear o login
   * até a confirmação transformaria qualquer problema de entrega — spam, provedor
   * fora do ar, domínio ainda não verificado — em impossibilidade de usar o produto.
   * O que a confirmação faz é liberar o que depende do e-mail ser real, começando
   * pela própria recuperação de senha, e sumir com o aviso na interface.
   */
  async sendEmailVerification(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerifiedAt) return;

    await this.prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    const raw = randomBytes(32).toString('base64url');
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashResetToken(raw),
        expiresAt: new Date(
          Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000,
        ),
      },
    });

    await this.mail.send(
      user.email,
      'Confirme seu e-mail — JUMP',
      `Olá, ${user.fullName}.\n\n` +
        `Confirme seu endereço de e-mail pelo link abaixo. Ele vale por ` +
        `${EMAIL_VERIFICATION_TTL_HOURS} horas:\n\n` +
        `${this.appUrl()}/verify-email?token=${raw}\n\n` +
        `Você já pode usar a plataforma normalmente — a confirmação serve para ` +
        `garantir que conseguimos falar com você, inclusive para recuperar a senha.`,
    );
  }

  async verifyEmail(rawToken: string): Promise<void> {
    const invalid = () =>
      new BadRequestException('Link inválido ou expirado. Peça um novo.');

    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashResetToken(rawToken) },
    });
    if (!token || token.usedAt || token.expiresAt < new Date()) throw invalid();

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  /**
   * Pedido de recuperação de senha.
   *
   * **Responde igual para e-mail existente e inexistente**, e é por isso que não há
   * retorno nem exceção aqui: qualquer diferença — mensagem, código de status ou até
   * tempo de resposta — transformaria este endpoint numa ferramenta para descobrir
   * quem tem conta na plataforma.
   *
   * Tokens anteriores do mesmo usuário são invalidados: pedir de novo deve substituir
   * o link antigo, não acumular vários válidos ao mesmo tempo.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) return;

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const raw = randomBytes(32).toString('base64url');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(raw),
        expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000),
      },
    });

    await this.mail.send(
      user.email,
      'Redefinição de senha — JUMP',
      `Olá, ${user.fullName}.\n\n` +
        `Recebemos um pedido para redefinir a sua senha. O link abaixo vale por ` +
        `${RESET_TTL_MINUTES} minutos e só pode ser usado uma vez:\n\n` +
        `${this.appUrl()}/reset-password?token=${raw}\n\n` +
        `Se não foi você que pediu, ignore esta mensagem — a sua senha continua a mesma.`,
    );
  }

  /**
   * Redefine a senha e **encerra todas as sessões abertas** do usuário.
   *
   * Esse último ponto é o que dá sentido ao recurso: quem redefine a senha
   * normalmente está reagindo a uma conta comprometida, e deixar as sessões antigas
   * vivas manteria o invasor conectado apesar da troca.
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const invalid = () =>
      new BadRequestException('Link inválido ou expirado. Peça um novo.');

    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(rawToken) },
    });
    if (!token || token.usedAt || token.expiresAt < new Date()) throw invalid();

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  /**
   * URL do front para montar os links dos e-mails: `APP_URL` quando definida, senão
   * a primeira origem permitida no CORS — que em desenvolvimento já é onde o front roda.
   */
  private appUrl(): string {
    return (
      this.config.get<string>('APP_URL') ??
      (this.config.get<string>('CORS_ORIGIN') ?? '').split(',')[0].trim()
    );
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
