import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PlanKey } from '../../../../generated/prisma/enums';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto';

export enum AdminUserStatusFilter {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

/**
 * Busca e filtros vivem no servidor junto com a paginação — não dá para separar os
 * dois. Filtrar no cliente uma página de 20 linhas produziria resultado errado assim
 * que existisse a linha 21: a interface esconderia usuários que casam com o filtro só
 * porque ficaram fora da página carregada.
 */
export class ListAdminUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(AdminUserStatusFilter, {
    message: 'status deve ser ATIVO ou INATIVO.',
  })
  status?: AdminUserStatusFilter;

  @IsOptional()
  @IsEnum(PlanKey, { message: 'plan deve ser FREE, PRO ou PREMIUM.' })
  plan?: PlanKey;
}
