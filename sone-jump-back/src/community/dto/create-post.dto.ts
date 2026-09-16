import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { PostType } from '../../../generated/prisma/enums';

export class CreatePostDto {
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsString()
  @Length(1, 2000)
  content: string;

  /** Publicar dentro de um grupo. Exige participar dele. */
  @IsOptional()
  @IsInt()
  @Min(1)
  groupId?: number;
}
