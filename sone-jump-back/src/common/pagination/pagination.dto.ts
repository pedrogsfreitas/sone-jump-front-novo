import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Paginação por `limit`/`offset` para as listagens que crescem sem teto.
 *
 * O `Max(100)` é o ponto principal: sem ele, `?limit=999999` faria o banco devolver a
 * tabela inteira numa requisição — o problema que a paginação existe para evitar.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit deve ser um número inteiro.' })
  @Min(1)
  @Max(100, { message: 'limit não pode passar de 100.' })
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset deve ser um número inteiro.' })
  @Min(0)
  offset?: number = 0;
}

/**
 * Para listagens cuja interface mostra tudo de uma vez, sem controles de página.
 *
 * O padrão sobe para 100 porque com 20 a tela esconderia itens em silêncio assim que
 * a lista crescesse; o teto de 100 continua valendo, então a resposta nunca fica sem
 * limite. A resposta segue sendo um array puro: quem consome não muda.
 */
export class FullListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit deve ser um número inteiro.' })
  @Min(1)
  @Max(100, { message: 'limit não pode passar de 100.' })
  limit?: number = 100;
}

/**
 * `total` é a contagem de tudo que casa com o filtro, não do que veio nesta página —
 * é o que permite à interface dizer "mostrando 1–20 de 137" e saber quantas páginas
 * existem.
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
