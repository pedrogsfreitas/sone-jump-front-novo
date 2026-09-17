import { describe, expect, it } from 'vitest'
import { formatDate, formatDateOnly, formatDuration } from './format'

/**
 * A distinção entre as duas funções é o que consertou datas erradas em duas telas ao
 * mesmo tempo: sessão de estudo aparecendo um dia antes e mentoria noturna aparecendo
 * um dia depois. Os testes fixam os dois lados para a confusão não voltar.
 */
describe('formatDate — data e hora, no fuso de quem olha', () => {
  it('mentoria às 22h continua no mesmo dia', () => {
    // 2026-09-21T01:00Z = 20/09 às 22h em São Paulo
    expect(formatDate('2026-09-21T01:00:00.000Z')).toBe('20/09/2026')
  })

  it('cadastro às 23h30 continua no mesmo dia', () => {
    expect(formatDate('2026-09-15T02:30:00.000Z')).toBe('14/09/2026')
  })
})

describe('formatDateOnly — coluna só de data, guardada como meia-noite UTC', () => {
  it('sessão de estudo do dia 14 aparece como 14', () => {
    expect(formatDateOnly('2026-09-14T00:00:00.000Z')).toBe('14/09/2026')
  })

  it('prazo de meta no primeiro dia do mês não volta para o mês anterior', () => {
    expect(formatDateOnly('2026-10-01T00:00:00.000Z')).toBe('01/10/2026')
  })
})

describe('formatDuration', () => {
  it.each([
    [45, '45 min'],
    [60, '1h'],
    [90, '1h 30min'],
    [600, '10h'],
    [0, '0 min'],
  ])('%i minutos vira "%s"', (minutos, esperado) => {
    expect(formatDuration(minutos)).toBe(esperado)
  })
})
