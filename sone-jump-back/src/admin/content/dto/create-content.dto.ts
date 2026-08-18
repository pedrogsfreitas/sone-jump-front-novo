import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ContentLevel,
  ContentPlatform,
  ContentStatus,
  ContentType,
} from '../../../../generated/prisma/enums';

class SyllabusItemDto {
  @IsString()
  @Length(1, 160)
  title: string;
}

export class CreateContentDto {
  @IsString()
  @Length(2, 160)
  title: string;

  @IsEnum(ContentPlatform)
  platform: ContentPlatform;

  @IsEnum(ContentType)
  type: ContentType;

  @IsInt()
  @Min(1)
  @Max(6000)
  durationMinutes: number;

  @IsEnum(ContentLevel)
  level: ContentLevel;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsString()
  @Length(1, 2000)
  description: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  @Length(1, 8)
  thumbnailEmoji?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  prerequisites?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => SyllabusItemDto)
  syllabus?: SyllabusItemDto[];
}
