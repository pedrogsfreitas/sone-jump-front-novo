import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { RemoteType } from '../../../../generated/prisma/enums';

export class CreateJobDto {
  @IsString()
  @Length(2, 160)
  title: string;

  @IsString()
  @Length(1, 120)
  companyName: string;

  @IsOptional()
  @IsString()
  companyLogoUrl?: string;

  @IsString()
  @Length(1, 120)
  location: string;

  @IsEnum(RemoteType)
  remoteType: RemoteType;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsString()
  @Length(1, 4000)
  description: string;

  @IsOptional()
  @IsInt()
  partnerId?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsInt({ each: true })
  skillIds?: number[];
}
