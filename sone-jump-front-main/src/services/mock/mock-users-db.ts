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
};

function readAll(): MockUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
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

export function createUser(data: Omit<MockUser, "id" | "createdAt">): MockUser {
  const users = readAll();
  const user: MockUser = {
    ...data,
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