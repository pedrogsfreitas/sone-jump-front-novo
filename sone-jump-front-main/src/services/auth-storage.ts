const TOKEN_KEY = "token";

export type Role = "STUDENT" | "MENTOR" | "ADMIN";

interface JwtPayload {
  sub: number;
  role: Role;
  iat: number;
  exp: number;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Decodes the JWT payload client-side. This reads the claims only — it does NOT
 * verify the signature, which is not something a browser can safely do anyway (the
 * secret can't live in client code). The server still verifies every request. */
function decodeToken(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

/** True only when a token exists, decodes, and hasn't passed its exp claim yet. */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload) return false;
  return payload.exp * 1000 > Date.now();
}

export function getRole(token: string | null): Role | null {
  if (!token) return null;
  return decodeToken(token)?.role ?? null;
}
