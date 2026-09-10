import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';

/**
 * `login/register` e `login/authenticate` mantêm os caminhos que o front já chamava
 * desde o início (`src/services/login/login.ts`).
 *
 * Todo o resto — refresh, logout e a recuperação de senha — está ligado no front.
 */
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login/register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login/authenticate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async authenticate(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { id, accessToken, refreshToken } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken.raw, refreshToken.expiresAt);
    return { id, token: accessToken };
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!raw) throw new UnauthorizedException('Sessão inválida.');

    const { id, accessToken, refreshToken } =
      await this.authService.refresh(raw);
    this.setRefreshCookie(res, refreshToken.raw, refreshToken.expiresAt);
    return { id, token: accessToken };
  }

  /**
   * Sempre 204, exista o e-mail ou não. Uma resposta diferente para e-mail cadastrado
   * transformaria isto num verificador de quem tem conta aqui.
   *
   * Limite baixo: é um endpoint que dispara e-mail a partir de entrada anônima.
   */
  @Post('auth/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(dto.email);
  }

  @Post('auth/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
  }

  /**
   * Público: quem clica no link do e-mail pode não estar logado — inclusive em
   * outro dispositivo. O token é a credencial aqui.
   */
  @Post('auth/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token);
  }

  /** Reenvio: exige sessão, então vale para o próprio usuário e mais ninguém. */
  @Post('auth/resend-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard)
  async resendVerification(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.sendEmailVerification(user.id);
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(raw);
    // Os atributos precisam bater com os usados ao gravar, senão o navegador trata
    // como outro cookie e o antigo continua lá.
    const isProduction = this.config.get('NODE_ENV') === 'production';
    res.clearCookie(REFRESH_COOKIE, {
      path: REFRESH_COOKIE_PATH,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
    });
  }

  /**
   * Em produção o front e a API ficam em domínios diferentes (ex.: front na Vercel,
   * API no Render), o que torna a chamada *cross-site*. Com `sameSite: 'strict'` o
   * navegador simplesmente não envia o cookie nesse caso — e a renovação de sessão
   * pararia de funcionar em silêncio, só no ambiente publicado.
   *
   * `none` exige `secure: true` (o navegador rejeita a combinação sem HTTPS), e é
   * exatamente essa a condição em produção. Em desenvolvimento tudo é `localhost`,
   * então `strict` continua valendo e é a opção mais restritiva.
   */
  private setRefreshCookie(res: Response, token: string, expiresAt: Date) {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      path: REFRESH_COOKIE_PATH,
      expires: expiresAt,
    });
  }
}
