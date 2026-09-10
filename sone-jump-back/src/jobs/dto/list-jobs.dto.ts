import { IsEnum, IsOptional } from 'class-validator';
import { RemoteType } from '../../../generated/prisma/enums';
import { FullListQueryDto } from '../../common/pagination/pagination.dto';

/**
 * A resposta continua sendo um array — a tela de Vagas não tem controles de página.
 * O que `FullListQueryDto` acrescenta é o teto: sem ele, o endpoint devolvia a tabela
 * inteira e crescia junto com ela.
 */
export class ListJobsDto extends FullListQueryDto {
  @IsOptional()
  @IsEnum(RemoteType)
  remoteType?: RemoteType;
}
