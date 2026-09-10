import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import {
  OnboardingArea,
  OnboardingGoal,
  OnboardingLevel,
  OnboardingWeeklyTime,
} from '../../../generated/prisma/enums';

/**
 * As quatro respostas do questionário inicial. O model `OnboardingProfile` foi
 * desenhado para esta tela desde a Fase 1, mas nunca ganhou endpoint — o front
 * coletava tudo e descartava ao ir para o cadastro.
 */
export class SaveOnboardingDto {
  @IsEnum(OnboardingGoal, { message: 'goal inválido.' })
  goal: OnboardingGoal;

  @IsEnum(OnboardingArea, { message: 'area inválida.' })
  area: OnboardingArea;

  @IsEnum(OnboardingLevel, { message: 'level inválido.' })
  level: OnboardingLevel;

  @IsEnum(OnboardingWeeklyTime, { message: 'weeklyTime inválido.' })
  weeklyTime: OnboardingWeeklyTime;

  /**
   * Carreira correspondente à área escolhida. Opcional porque a área é a resposta do
   * quiz e a carreira é a consequência dela — nem toda área precisa ter uma carreira
   * cadastrada para o questionário ser salvo.
   */
  @IsOptional()
  @IsString()
  @Length(1, 60)
  careerSlug?: string;
}
