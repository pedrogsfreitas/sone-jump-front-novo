import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  /**
   * Exigir a senha atual é o que separa "trocar a senha" de "sequestrar a conta":
   * sem isso, um token vazado bastaria para trancar o dono do lado de fora.
   */
  @IsString()
  @MinLength(1, { message: 'Informe a senha atual.' })
  currentPassword: string;

  // Mesma regra do cadastro e da redefinição por e-mail.
  @IsString()
  @MinLength(8, { message: 'A nova senha deve ter ao menos 8 caracteres.' })
  newPassword: string;
}
