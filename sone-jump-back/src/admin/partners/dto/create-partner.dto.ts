import { IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import {
  IntegrationType,
  PartnerStatus,
} from '../../../../generated/prisma/enums';

export class CreatePartnerDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsEnum(IntegrationType)
  type: IntegrationType;

  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @IsString()
  @Length(1, 500)
  description: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
