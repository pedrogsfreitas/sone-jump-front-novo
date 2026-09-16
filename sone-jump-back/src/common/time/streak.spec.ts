import { toDateColumn } from './calendar';
import { computeStreak, currentStreakAsOf } from './streak';

describe('computeStreak', () => {
  it('sem dias, sem sequência', () => {
    expect(computeStreak([])).toEqual({
      current: 0,
      longest: 0,
      lastDay: null,
    });
  });

  it('conta dias consecutivos até o mais recente', () => {
    expect(computeStreak(['2026-09-12', '2026-09-13', '2026-09-14'])).toEqual({
      current: 3,
      longest: 3,
      lastDay: '2026-09-14',
    });
  });

  it('não depende da ordem de chegada — sessão retroativa não quebra a sequência', () => {
    // Estudou 13 e 14, e só depois registrou a sessão esquecida do dia 12.
    expect(
      computeStreak(['2026-09-13', '2026-09-14', '2026-09-12']).current,
    ).toBe(3);
  });

  it('repetição do mesmo dia conta uma vez', () => {
    expect(computeStreak(['2026-09-14', '2026-09-14']).current).toBe(1);
  });

  it('um buraco zera a sequência atual, mas o recorde fica', () => {
    expect(
      computeStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-10']),
    ).toEqual({ current: 1, longest: 3, lastDay: '2026-09-10' });
  });
});

describe('currentStreakAsOf — sequência exibida', () => {
  const HOJE = '2026-09-15';

  it('estudou hoje: mantém', () => {
    expect(currentStreakAsOf(5, toDateColumn('2026-09-15'), HOJE)).toBe(5);
  });

  it('estudou ontem: mantém, o dia de hoje ainda não acabou', () => {
    expect(currentStreakAsOf(5, toDateColumn('2026-09-14'), HOJE)).toBe(5);
  });

  it('último estudo anteontem: a sequência já quebrou', () => {
    expect(currentStreakAsOf(5, toDateColumn('2026-09-13'), HOJE)).toBe(0);
  });

  it('nunca estudou', () => {
    expect(currentStreakAsOf(0, null, HOJE)).toBe(0);
  });
});
