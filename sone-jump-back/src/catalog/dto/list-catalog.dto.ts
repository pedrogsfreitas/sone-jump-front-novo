import { IsEnum, IsOptional } from 'class-validator';
import { ContentPlatform, ContentType } from '../../../generated/prisma/enums';
import { FullListQueryDto } from '../../common/pagination/pagination.dto';

/** Mesma decisão do `ListJobsDto`: formato de resposta preservado, teto imposto. */
export class ListCatalogDto extends FullListQueryDto {
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @IsOptional()
  @IsEnum(ContentPlatform)
  platform?: ContentPlatform;
}
