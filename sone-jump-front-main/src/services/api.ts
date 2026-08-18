import { getToken } from "./auth-storage";

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

export async function apiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, headers = {} } = options;

  const normalizedHeaders = new Headers(headers);
  if (body !== undefined && !normalizedHeaders.has("Content-Type")) {
    normalizedHeaders.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !normalizedHeaders.has("Authorization")) {
    normalizedHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(endpoint), {
    method,
    headers: normalizedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Sends/receives the httpOnly refresh-token cookie the backend sets on login.
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const responseBody = contentType.includes("application/json")
    ? ((await response.json()) as unknown)
    : ((await response.text()) as unknown);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(responseBody, response.status), response.status);
  }

  return responseBody as TResponse;
}
