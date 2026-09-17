import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Falha cedo e explícito se o fuso não for o esperado — melhor do que um teste de
// data quebrando com uma diferença de um dia sem explicação.
const fusoAtual = Intl.DateTimeFormat().resolvedOptions().timeZone
if (fusoAtual !== 'America/Sao_Paulo') {
  throw new Error(
    `Os testes esperam TZ=America/Sao_Paulo, mas o ambiente está em ${fusoAtual}. ` +
      'Veja vitest.config.ts.',
  )
}

afterEach(() => {
  cleanup()
  // O token vive no localStorage e é lido por quase todo serviço: sem limpar, um
  // teste que faz login deixaria o seguinte "logado" sem ter pedido isso.
  localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
