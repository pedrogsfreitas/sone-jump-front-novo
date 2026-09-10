import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(1, { message: 'Token obrigatório.' })
  token: string;

  // Mesma regra do cadastro — não faria sentido a redefinição aceitar uma senha
  // mais fraca do que a que o registro exige.
  @IsString()
  @MinLength(8, { message: 'Senha deve ter ao menos 8 caracteres.' })
  password: string;
}
