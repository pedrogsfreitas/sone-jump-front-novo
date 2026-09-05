/**
 * MOCK DB — usuários (fase sem back-end)
 * ---------------------------------------------------------------------------
 * Enquanto o back não está no ar, o cadastro precisa funcionar de ponta a
 * ponta mesmo assim. Este arquivo simula a tabela de usuários guardando tudo
 * em localStorage, com a mesma "forma" que o back real usa (RegisterParams).
 *
 * Quando o back voltar a ser plugado, é só remover o uso deste arquivo em
 * `services/login/login.ts` (funções `register` e `login`) e voltar a chamar
 * `apiRequest` — nada nas telas (Register.tsx / Login.tsx) precisa mudar,
 * pois o contrato das funções é o mesmo.
 */

import type { Role } from "../auth-storage";
import { getToken, getUserId } from "../auth-storage";
import { ApiError } from "../api";

const STORAGE_KEY = "mock_users_db";

export type MockUser = {
  id: number;
  fullname: string;
  username: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  // Campos de perfil/gamificação — não fazem parte do cadastro em si, mas
  // toda tela logada (Dashboard, Perfil etc.) espera que já existam desde
  // a criação da conta. Um usuário novo sempre começa "zerado".
  bio: string | null;
  headline: string | null;
  location: string | null;
  avatarColor: string;
  focusMode: boolean;
  xpTotal: number;
  level: number;
  streakCurrentDays: number;
  streakLongestDays: number;
  lastAccessAt: string | null;
};

// Valores padrão dos campos de perfil/gamificação. Servem tanto pra criar um
// usuário novo quanto pra "curar" registros salvos num formato mais antigo,
// de antes desses campos existirem (ver normalize() abaixo) — sem isso, toda
// vez que esse formato ganhar um campo novo, contas já criadas quebrariam a
// tela ao ler `undefined` onde um número/texto era esperado.
const DEFAULT_PROFILE_FIELDS = {
  bio: null,
  headline: null,
  location: null,
  avatarColor: "purple",
  focusMode: false,
  xpTotal: 0,
  level: 1,
  streakCurrentDays: 0,
  streakLongestDays: 0,
  lastAccessAt: null,
} satisfies Pick<
  MockUser,
  "bio" | "headline" | "location" | "avatarColor" | "focusMode" | "xpTotal" | "level" | "streakCurrentDays" | "streakLongestDays" | "lastAccessAt"
>;

function normalize(user: MockUser): MockUser {
  return { ...DEFAULT_PROFILE_FIELDS, ...user };
}

function readAll(): MockUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const users = raw ? (JSON.parse(raw) as MockUser[]) : [];
    return users.map(normalize);
  } catch {
    return [];
  }
}

function writeAll(users: MockUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function nextId(users: MockUser[]): number {
  return users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}

export type ConflictField = "username" | "email" | "cpf";

/** Retorna qual campo já está em uso, ou null se não há conflito. */
export function findConflict(username: string, email: string, cpf: string): ConflictField | null {
  const users = readAll();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.find(
    (u) =>
      u.username.toLowerCase() === normalizedUsername ||
      u.email.toLowerCase() === normalizedEmail ||
      u.cpf === cpf,
  );

  if (!existing) return null;
  if (existing.username.toLowerCase() === normalizedUsername) return "username";
  if (existing.email.toLowerCase() === normalizedEmail) return "email";
  return "cpf";
}

export type NewUserInput = {
  fullname: string;
  username: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
  role: Role;
};

/** Cria o usuário já com o estado "zerado" de perfil/gamificação. */
export function createUser(data: NewUserInput): MockUser {
  const users = readAll();
  const user: MockUser = {
    ...data,
    ...DEFAULT_PROFILE_FIELDS,
    id: nextId(users),
    createdAt: new Date().toISOString(),
  };
  writeAll([...users, user]);
  return user;
}

export function findByUsername(username: string): MockUser | undefined {
  const normalized = username.trim().toLowerCase();
  return readAll().find((u) => u.username.toLowerCase() === normalized);
}

function findById(id: number): MockUser | undefined {
  return readAll().find((u) => u.id === id);
}

/**
 * Resolve o usuário logado a partir do token salvo — o equivalente mockado
 * de "quem é o dono deste Bearer token" que o back faria em cada request.
 * Lança o mesmo tipo de erro (ApiError 401) que uma chamada real faria sem
 * sessão válida.
 */
export function getCurrentUser(): MockUser {
  const id = getUserId(getToken());
  const user = id !== null ? findById(id) : undefined;
  if (!user) {
    throw new ApiError("Sessão expirada ou inválida.", 401);
  }
  return user;
}

/** Atualiza campos do usuário logado e persiste. */
export function updateCurrentUser(patch: Partial<Omit<MockUser, "id" | "createdAt">>): MockUser {
  const current = getCurrentUser();
  const users = readAll();
  const updated: MockUser = { ...current, ...patch };
  writeAll(users.map((u) => (u.id === current.id ? updated : u)));
  return updated;
}

const MOCK_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias — folga pra testar as próximas telas sem deslogar

/**
 * Gera um token no mesmo formato "header.payload.signature" que
 * `auth-storage.ts` sabe ler (ele só decodifica o payload, não confere
 * assinatura). A assinatura aqui é só um texto fixo — não tem valor de
 * segurança nenhum, é só pra manter a "forma" de um JWT real.
 */
export function createMockToken(user: MockUser): string {
  const header = btoa(JSON.stringify({ alg: "mock", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({ sub: user.id, role: user.role, iat: now, exp: now + MOCK_TOKEN_TTL_SECONDS }),
  );
  return `${header}.${payload}.mock-signature`;
}