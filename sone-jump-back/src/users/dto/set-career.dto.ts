import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { OnboardingLevel } from '../../../generated/prisma/enums';

export class SetCareerDto {
  /**
   * Identidade da carreira é o `slug` — legível, estável e o mesmo em todo lugar
   * (URL, importação de roadmap, quiz de carreira). O `id` é cuid: opaco e diferente
   * a cada ambiente, o que obrigava o front a carregar a lista só para descobrir qual
   * mandar.
   */
  @IsString()
  @Length(1, 60, { message: 'careerSlug inválido.' })
  careerSlug: string;

  /**
   * Experiência declarada. Opcional: escolher a carreira sem informar nível é um
   * caminho legítimo (a tela de escolha direta não pergunta isso — só o quiz).
   */
  @IsOptional()
  @IsEnum(OnboardingLevel, {
    message: 'level deve ser INICIANTE, BASICO, EXPERIENTE ou SENIOR.',
  })
  level?: OnboardingLevel;
}
