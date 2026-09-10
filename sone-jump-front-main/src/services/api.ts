import { clearToken, getToken, isTokenValid, setToken } from "./auth-storage";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TBody> = {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function buildUrl(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const normalizedBaseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${normalizedBaseUrl}${normalizedEndpoint}`;
}

function getErrorMessage(responseBody: unknown, status: number): string {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "message" in responseBody &&
    typeof responseBody.message === "string"
  ) {
    return responseBody.message;
  }

  if (typeof responseBody === "string" && responseBody.trim() !== "") {
    return responseBody;
  }

  return `Erro na requisição (${status}).`;
}

const REFRESH_ENDPOINT = "/api/auth/refresh";

/** Endpoints cujo 401 é a resposta legítima, e não uma sessão expirada: senha errada
 * no login e refresh token inválido. Tentar renovar a sessão neles daria um laço. */
const NO_RETRY_ENDPOINTS = [REFRESH_ENDPOINT, "/api/login/authenticate", "/api/login/register"];

/** Uma renovação em voo é compartilhada por todas as chamadas que tomaram 401 ao mesmo
 * tempo. Sem isso, uma tela que dispara cinco requisições em paralelo tentaria cinco
 * refreshes — e como o back rotaciona o token a cada uso e trata reutilização como
 * roubo, os concorrentes derrubariam TODAS as sessões do usuário. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        // O refresh token vive num cookie httpOnly: o JS não o lê nem o envia à mão,
        // quem manda é o navegador por causa do `credentials: "include"`.
        const response = await fetch(buildUrl(REFRESH_ENDPOINT), {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) return null;

        const { token } = (await response.json()) as { token: string };
        setToken(token);
        return token;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/**
 * Há sessão utilizável para renderizar uma área logada? Ou o access token ainda vale,
 * ou o refresh token (cookie de 30 dias) consegue emitir um novo.
 *
 * Os guards dos layouts precisam disto em vez de olharem só `isTokenValid`: o access
 * token dura 15 minutos, então recarregar a página depois desse tempo mandava a pessoa
 * para o /login mesmo com o refresh válido por mais 29 dias.
 */
export async function ensureSession(): Promise<boolean> {
  if (isTokenValid(getToken())) return true;
  return (await refreshAccessToken()) !== null;
}

/** Sessão irrecuperável: limpa o token e manda para o login, preservando para onde a
 * pessoa queria ir. O `replace` evita encher o histórico quando várias chamadas falham. */
function redirectToLogin(): void {
  clearToken();
  const { pathname, search } = window.location;
  if (pathname === "/login") return;
  window.location.replace(`/login?next=${encodeURIComponent(pathname + search)}`);
}

async function performRequest<TBody>(
  endpoint: string,
  options: RequestOptions<TBody>,
): Promise<Response> {
  const { method = "GET", body, headers = {} } = options;

  const normalizedHeaders = new Headers(headers);
  if (body !== undefined && !normalizedHeaders.has("Content-Type")) {
    normalizedHeaders.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !normalizedHeaders.has("Authorization")) {
    normalizedHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(buildUrl(endpoint), {
    method,
    headers: normalizedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Sends/receives the httpOnly refresh-token cookie the backend sets on login.
    credentials: "include",
  });
}

export async function apiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  let response = await performRequest(endpoint, options);

  // O access token dura 15 minutos. Sem esta renovação, qualquer sessão mais longa que
  // isso quebrava no meio do uso, mesmo com o refresh token (30 dias) válido no cookie.
  if (
    response.status === 401 &&
    getToken() !== null &&
    !NO_RETRY_ENDPOINTS.some((path) => endpoint.startsWith(path))
  ) {
    const renewed = await refreshAccessToken();
    if (renewed) {
      response = await performRequest(endpoint, options);
    } else {
      redirectToLogin();
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const responseBody = contentType.includes("application/json")
    ? ((await response.json()) as unknown)
    : ((await response.text()) as unknown);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(responseBody, response.status), response.status);
  }

  return responseBody as TResponse;
}
