import { IsEnum, IsOptional } from 'class-validator';
import { ContentPlatform, ContentType } from '../../../generated/prisma/enums';

export class ListCatalogDto {
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @IsOptional()
  @IsEnum(ContentPlatform)
  platform?: ContentPlatform;
}
