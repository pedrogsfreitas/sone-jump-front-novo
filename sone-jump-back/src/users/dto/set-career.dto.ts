import { IsString, Length } from 'class-validator';

export class SetCareerDto {
  @IsString()
  @Length(1, 40, { message: 'careerId inválido.' })
  careerId: string;
}
