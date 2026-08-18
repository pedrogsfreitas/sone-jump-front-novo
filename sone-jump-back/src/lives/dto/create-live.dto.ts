import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateLiveDto {
  @IsString()
  @Length(2, 160)
  title: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  topics?: string[];
}
