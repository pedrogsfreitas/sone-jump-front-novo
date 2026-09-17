import { describe, expect, it, vi } from 'vitest'
import { canonicalUrlFor, redirectToCanonicalHost } from './canonical-host'

describe('canonicalUrlFor', () => {
  it('www vira o domínio oficial', () => {
    expect(canonicalUrlFor(new URL('https://www.jumpapi.com.br/'))).toBe(
      'https://jumpapi.com.br/',
    )
  })

  it('preserva caminho, query e âncora — o link compartilhado continua valendo', () => {
    expect(
      canonicalUrlFor(new URL('https://www.jumpapi.com.br/app/roadmap?tab=2#topo')),
    ).toBe('https://jumpapi.com.br/app/roadmap?tab=2#topo')
  })

  it('preserva o caminho do link de verificação de e-mail', () => {
    expect(canonicalUrlFor(new URL('https://www.jumpapi.com.br/verify?token=abc123'))).toBe(
      'https://jumpapi.com.br/verify?token=abc123',
    )
  })

  it('quem já está no domínio oficial não é redirecionado', () => {
    expect(canonicalUrlFor(new URL('https://jumpapi.com.br/app'))).toBeNull()
  })

  /** Sem isto, `npm run dev` entraria em laço tentando sair do localhost. */
  it('ambiente de desenvolvimento não é tocado', () => {
    expect(canonicalUrlFor(new URL('http://localhost:5173/app'))).toBeNull()
  })

  it('a URL antiga do Static Web Apps não é tocada', () => {
    expect(
      canonicalUrlFor(new URL('https://nice-ground-02574720f.3.azurestaticapps.net/')),
    ).toBeNull()
  })
})

describe('redirectToCanonicalHost', () => {
  it('redireciona com replace, para o botão voltar não criar laço', () => {
    const location = { href: 'https://www.jumpapi.com.br/app', replace: vi.fn() }

    expect(redirectToCanonicalHost(location)).toBe(true)
    expect(location.replace).toHaveBeenCalledWith('https://jumpapi.com.br/app')
  })

  it('no domínio oficial, não faz nada', () => {
    const location = { href: 'https://jumpapi.com.br/app', replace: vi.fn() }

    expect(redirectToCanonicalHost(location)).toBe(false)
    expect(location.replace).not.toHaveBeenCalled()
  })
})
