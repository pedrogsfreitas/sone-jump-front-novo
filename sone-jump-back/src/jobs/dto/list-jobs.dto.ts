import { IsEnum, IsOptional } from 'class-validator';
import { RemoteType } from '../../../generated/prisma/enums';

export class ListJobsDto {
  @IsOptional()
  @IsEnum(RemoteType)
  remoteType?: RemoteType;
}
