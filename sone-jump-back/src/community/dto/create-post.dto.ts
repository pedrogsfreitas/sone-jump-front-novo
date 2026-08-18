import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PostType } from '../../../generated/prisma/enums';

export class CreatePostDto {
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsString()
  @Length(1, 2000)
  content: string;
}
