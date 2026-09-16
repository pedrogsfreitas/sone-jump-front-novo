import {
  addDays,
  dayKeyFromInput,
  dayKeyOf,
  daysBetween,
  startOfMonth,
  startOfWeek,
  weekdayOf,
} from './calendar';

describe('calendar — dia de São Paulo', () => {
  it('23h30 em São Paulo ainda é o mesmo dia, mesmo já sendo amanhã em UTC', () => {
    // 2026-09-15T02:30Z = 14/09 às 23h30 em São Paulo
    expect(dayKeyOf(new Date('2026-09-15T02:30:00.000Z'))).toBe('2026-09-14');
  });

  it('meia-noite em São Paulo vira o dia', () => {
    expect(dayKeyOf(new Date('2026-09-15T03:00:00.000Z'))).toBe('2026-09-15');
  });

  it('data pura enviada pelo cliente é usada como está', () => {
    expect(dayKeyFromInput('2026-09-14')).toBe('2026-09-14');
  });

  it('instante completo é convertido para o dia de São Paulo', () => {
    expect(dayKeyFromInput('2026-09-14T23:30:00-03:00')).toBe('2026-09-14');
    expect(dayKeyFromInput('2026-09-15T01:00:00.000Z')).toBe('2026-09-14');
  });

  it('soma e diferença de dias atravessam mês e ano', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(daysBetween('2026-09-28', '2026-10-02')).toBe(4);
    expect(daysBetween('2026-10-02', '2026-09-28')).toBe(-4);
  });

  it('semana começa na segunda — domingo pertence à semana anterior', () => {
    expect(weekdayOf('2026-09-13')).toBe(0); // domingo
    expect(startOfWeek('2026-09-13')).toBe('2026-09-07');
    expect(startOfWeek('2026-09-14')).toBe('2026-09-14'); // segunda
    expect(startOfWeek('2026-09-19')).toBe('2026-09-14'); // sábado
  });

  it('início do mês', () => {
    expect(startOfMonth('2026-09-15')).toBe('2026-09-01');
  });
});
