import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { FullListQueryDto } from '../../common/pagination/pagination.dto';

export class ListPostsQueryDto extends FullListQueryDto {
  /** Feed de um grupo. Sem o parâmetro, o feed geral — só publicações fora de grupo. */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'groupId deve ser um número inteiro.' })
  @Min(1)
  groupId?: number;

  /**
   * `me` e não um id: não existe perfil público de outros usuários, e aceitar
   * qualquer id transformaria o endpoint numa forma de listar o histórico de alguém.
   */
  @IsOptional()
  @IsIn(['me'], { message: 'author aceita apenas "me".' })
  author?: 'me';
}
