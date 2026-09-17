import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from './api'
import { setToken } from './auth-storage'

type RespostaFake = { status?: number; json?: unknown; text?: string }

function resposta({ status = 200, json, text }: RespostaFake): Response {
  const body = json !== undefined ? JSON.stringify(json) : (text ?? '')
  return new Response(body, {
    status,
    headers: { 'content-type': json !== undefined ? 'application/json' : 'text/plain' },
  })
}

function mockFetch(...respostas: Response[]) {
  const fn = vi.fn()
  respostas.forEach((r) => fn.mockResolvedValueOnce(r))
  vi.stubGlobal('fetch', fn)
  return fn
}

/** JWT não assinado com validade longa — o front só lê as claims. */
function tokenValido(): string {
  const base64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${base64({ alg: 'HS256' })}.${base64({
    sub: 1,
    role: 'STUDENT',
    exp: Math.floor(Date.now() / 1000) + 900,
  })}.assinatura`
}

beforeEach(() => {
  vi.stubGlobal('location', { ...window.location, replace: vi.fn(), pathname: '/app', search: '' })
})

describe('apiRequest — requisição', () => {
  it('monta a URL com a base configurada e manda cookie junto', async () => {
    const fetchMock = mockFetch(resposta({ json: { ok: true } }))

    await apiRequest('/api/progress/summary')

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/progress\/summary$/)
    // O refresh token vive num cookie httpOnly: sem isto ele nunca é enviado.
    expect(init.credentials).toBe('include')
  })

  it('manda o token quando existe', async () => {
    setToken(tokenValido())
    const fetchMock = mockFetch(resposta({ json: {} }))

    await apiRequest('/api/progress/summary')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(new Headers(init.headers).get('Authorization')).toMatch(/^Bearer /)
  })

  it('corpo vira JSON com o content-type certo', async () => {
    const fetchMock = mockFetch(resposta({ json: {} }))

    await apiRequest('/api/community/posts', { method: 'POST', body: { content: 'oi' } })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.body).toBe('{"content":"oi"}')
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json')
  })
})

describe('apiRequest — erros', () => {
  it('usa a mensagem que o back mandou', async () => {
    mockFetch(resposta({ status: 409, json: { message: 'Desafio já concluído.' } }))

    await expect(apiRequest('/api/skills/challenges/1/complete')).rejects.toThrow(
      'Desafio já concluído.',
    )
  })

  it('erro sem corpo conhecido vira mensagem genérica com o status', async () => {
    mockFetch(resposta({ status: 500, text: '' }))

    await expect(apiRequest('/api/progress/summary')).rejects.toThrow('Erro na requisição (500).')
  })

  it('o status fica acessível em ApiError', async () => {
    mockFetch(resposta({ status: 403, json: { message: 'Entre no grupo para publicar nele.' } }))

    const erro = await apiRequest('/api/community/posts').catch((e: unknown) => e)

    expect(erro).toBeInstanceOf(ApiError)
    expect((erro as ApiError).status).toBe(403)
  })
})

describe('apiRequest — renovação de sessão no 401', () => {
  it('renova o token e repete a chamada uma vez', async () => {
    setToken(tokenValido())
    const fetchMock = mockFetch(
      resposta({ status: 401, json: { message: 'expirado' } }),
      resposta({ json: { token: tokenValido() } }),
      resposta({ json: { ok: true } }),
    )

    await expect(apiRequest('/api/progress/summary')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  /** Renovar no próprio login daria laço: ali o 401 é resposta legítima. */
  it('401 no login não tenta renovar', async () => {
    setToken(tokenValido())
    const fetchMock = mockFetch(resposta({ status: 401, json: { message: 'Credenciais inválidas.' } }))

    await expect(
      apiRequest('/api/login/authenticate', { method: 'POST', body: {} }),
    ).rejects.toThrow('Credenciais inválidas.')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sem token guardado, não tenta renovar', async () => {
    const fetchMock = mockFetch(resposta({ status: 401, json: { message: 'sem sessão' } }))

    await expect(apiRequest('/api/progress/summary')).rejects.toThrow('sem sessão')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
