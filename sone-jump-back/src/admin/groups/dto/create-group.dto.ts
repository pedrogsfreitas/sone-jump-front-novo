import { IsOptional, IsString, Length } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @Length(2, 60)
  name: string;

  /**
   * Emoji mostrado ao lado do nome. Curto de propósito: a interface reserva o espaço
   * de um caractere, e um texto aqui quebraria o alinhamento da lista.
   */
  @IsOptional()
  @IsString()
  @Length(1, 8)
  icon?: string;
}
