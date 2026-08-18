import { IsString, Length } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @Length(1, 300)
  text: string;
}
