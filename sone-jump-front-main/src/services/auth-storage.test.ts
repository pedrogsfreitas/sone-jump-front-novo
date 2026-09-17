import { describe, expect, it } from 'vitest'
import { clearToken, getRole, getToken, getUserId, isTokenValid, setToken } from './auth-storage'

/** Monta um JWT sem assinar: o front só lê as claims, quem valida é o servidor. */
function token(payload: Record<string, unknown>): string {
  const base64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${base64({ alg: 'HS256' })}.${base64(payload)}.assinatura`
}

const daquiA = (segundos: number) => Math.floor(Date.now() / 1000) + segundos

describe('auth-storage — guarda do token', () => {
  it('guarda e devolve o token', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
  })

  it('limpar remove de vez', () => {
    setToken('abc')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('isTokenValid', () => {
  it('token com expiração no futuro é válido', () => {
    expect(isTokenValid(token({ sub: 1, role: 'STUDENT', exp: daquiA(900) }))).toBe(true)
  })

  it('token expirado é inválido', () => {
    expect(isTokenValid(token({ sub: 1, role: 'STUDENT', exp: daquiA(-1) }))).toBe(false)
  })

  it('sem token, inválido', () => {
    expect(isTokenValid(null)).toBe(false)
  })

  /** Texto qualquer no localStorage não pode explodir a aplicação inteira. */
  it('token corrompido é inválido, sem lançar erro', () => {
    expect(isTokenValid('isso-nao-e-um-jwt')).toBe(false)
  })
})

describe('claims lidas do token', () => {
  it('devolve o id e o papel', () => {
    const t = token({ sub: 42, role: 'ADMIN', exp: daquiA(900) })
    expect(getUserId(t)).toBe(42)
    expect(getRole(t)).toBe('ADMIN')
  })

  it('sem token, id e papel são nulos', () => {
    expect(getUserId(null)).toBeNull()
    expect(getRole(null)).toBeNull()
  })
})
