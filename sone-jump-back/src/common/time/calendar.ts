/**
 * "Dia" do produto — sequência, janela de retroatividade, teto diário, semana e mês.
 *
 * Tudo isso era calculado em UTC, e às 21h no Brasil o UTC já está no dia seguinte:
 * quem estudava à noite via a sessão contar para amanhã, e a data mais antiga que o
 * front oferecia era recusada. O dia agora é o calendário de São Paulo.
 *
 * Um fuso fixo, e não um por usuário, porque o produto é brasileiro e quase todo o
 * público está em UTC-3. Quem mora em UTC-4/-5 (Amazonas, Acre) ainda vira o dia uma
 * ou duas horas antes da meia-noite local — troca aceita para não ter de guardar e
 * validar o fuso de cada conta. Se um dia virar requisito, é aqui que muda.
 *
 * Usa `Intl` em vez de uma biblioteca de datas: o Node já traz a base de fusos
 * completa, e o que precisamos é só "que dia é este instante em São Paulo".
 */
export const APP_TIMEZONE = 'America/Sao_Paulo';

/** Dia no formato `YYYY-MM-DD`. Comparável como string e sem ambiguidade de fuso. */
export type DayKey = string;

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Que dia do calendário de São Paulo é este instante. */
export function dayKeyOf(instant: Date): DayKey {
  return formatter.format(instant);
}

export function today(): DayKey {
  return dayKeyOf(new Date());
}

/**
 * Interpreta o que o cliente mandou como dia. `2026-09-14` já é o dia e é usado como
 * está; um instante completo (`2026-09-14T23:30:00-03:00`) é convertido para o dia de
 * São Paulo. Sem essa distinção, `new Date('2026-09-14')` vira meia-noite UTC — que
 * em São Paulo ainda é dia 13.
 */
export function dayKeyFromInput(value: string): DayKey {
  return DAY_KEY.test(value) ? value : dayKeyOf(new Date(value));
}

/**
 * Colunas `@db.Date` não têm fuso: o Prisma as lê e grava como meia-noite UTC. Estas
 * duas funções são a única ponte entre esse formato e o `DayKey`.
 */
export function toDateColumn(day: DayKey): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

export function fromDateColumn(value: Date): DayKey {
  return value.toISOString().slice(0, 10);
}

export function addDays(day: DayKey, amount: number): DayKey {
  return fromDateColumn(
    new Date(toDateColumn(day).getTime() + amount * MS_PER_DAY),
  );
}

/** Quantos dias de `from` até `to`. Negativo quando `to` vem antes. */
export function daysBetween(from: DayKey, to: DayKey): number {
  return Math.round(
    (toDateColumn(to).getTime() - toDateColumn(from).getTime()) / MS_PER_DAY,
  );
}

/** 0 = domingo … 6 = sábado, a mesma convenção de `Date.getDay`. */
export function weekdayOf(day: DayKey): number {
  return toDateColumn(day).getUTCDay();
}

/** Segunda-feira da semana de `day`. */
export function startOfWeek(day: DayKey): DayKey {
  const weekday = weekdayOf(day);
  return addDays(day, weekday === 0 ? -6 : 1 - weekday);
}

export function startOfMonth(day: DayKey): DayKey {
  return `${day.slice(0, 7)}-01`;
}
