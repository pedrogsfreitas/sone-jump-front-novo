import { addDays, type DayKey, daysBetween, fromDateColumn } from './calendar';

export interface StreakSnapshot {
  current: number;
  longest: number;
  lastDay: DayKey | null;
}

/**
 * Sequência calculada a partir dos dias em que houve estudo, e não incrementada a
 * cada sessão.
 *
 * O cálculo incremental quebrava com a retroatividade que o produto permite: quem já
 * tinha estudado hoje e depois registrava a sessão esquecida de ontem via a sequência
 * voltar para 1 — "ontem" não é o dia seguinte ao último registrado, então parecia
 * uma quebra. Derivar do conjunto de dias não depende da ordem em que as sessões
 * chegam.
 *
 * `days` pode vir em qualquer ordem e com repetições.
 */
export function computeStreak(days: DayKey[]): StreakSnapshot {
  const unique = [...new Set(days)].sort();
  if (unique.length === 0) return { current: 0, longest: 0, lastDay: null };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    run = daysBetween(unique[i - 1], unique[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // `run` terminou no dia mais recente: é a sequência que chega até ele.
  return { current: run, longest, lastDay: unique[unique.length - 1] };
}

/**
 * A sequência guardada no usuário vale até o último dia estudado, mas o tempo passa
 * sem nenhuma escrita: quem parou de estudar há uma semana continuava vendo "5 dias".
 * Na leitura, a sequência só segue viva se houve estudo hoje ou ontem — ontem conta
 * porque o dia de hoje ainda não acabou.
 */
export function currentStreakAsOf(
  storedCurrent: number,
  lastStudyDate: Date | null,
  todayKey: DayKey,
): number {
  if (!lastStudyDate) return 0;
  return fromDateColumn(lastStudyDate) >= addDays(todayKey, -1)
    ? storedCurrent
    : 0;
}
