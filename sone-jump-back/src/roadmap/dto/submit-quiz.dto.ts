import { IsObject } from 'class-validator';

export class SubmitQuizDto {
  /**
   * Mapa `perguntaId -> opcaoEscolhidaId`.
   *
   * Objeto aberto de propósito: as perguntas de cada nó vêm do banco, então não há
   * uma lista fixa de chaves para declarar. A validação real é semântica e acontece
   * no serviço — chave que não corresponde a uma pergunta do nó simplesmente não casa,
   * e a resposta é reprovada.
   */
  @IsObject({ message: 'answers deve ser um objeto perguntaId -> opcaoId.' })
  answers: Record<string, string>;
}
