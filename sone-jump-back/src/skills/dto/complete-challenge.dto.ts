import { IsString, IsUrl, MaxLength } from 'class-validator';

export class CompleteChallengeDto {
  /**
   * Só `https`: o link é exibido como âncora clicável no perfil, e um protocolo livre
   * aceitaria `javascript:`. Qualquer host vale — resolução pode estar no GitHub,
   * GitLab, CodeSandbox ou StackBlitz, e restringir isso seria regra de produto
   * disfarçada de validação.
   *
   * O link é guardado, não verificado: ninguém abre o repositório para conferir se a
   * resolução existe. É registro e evidência, não correção automática.
   */
  @IsString()
  @MaxLength(500)
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: 'Informe o link da resolução começando com https://.' },
  )
  submissionUrl: string;
}
