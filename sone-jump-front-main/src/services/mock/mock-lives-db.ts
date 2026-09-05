/**
 * MOCK DB — lives (fase sem back-end)
 * ---------------------------------------------------------------------------
 * Mesma ideia de `mock-users-db.ts`: os dados ficam isolados aqui, guardados
 * em localStorage, e o serviço (`services/lives/lives.ts`) só consulta essa
 * "tabela".
 *
 * Começa VAZIA de propósito — ainda não existe nenhuma live de verdade (nem
 * um jeito de cadastrar uma), então o certo é não mostrar nenhuma, em vez de
 * inventar uma só pra tela não ficar vazia. As telas que dependem disso
 * (Dashboard, Lives) já tratam o caso de lista vazia normalmente.
 *
 * `createLive` já fica pronta pra quando existir uma tela (provavelmente no
 * Admin de Conteúdos) que realmente cadastre lives.
 */

import type { LiveSession, LiveStatus } from "../lives/lives";

const STORAGE_KEY = "mock_lives_db";

function readAll(): LiveSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LiveSession[]) : [];
  } catch {
    return [];
  }
}

function writeAll(lives: LiveSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lives));
}

function nextId(lives: LiveSession[]): number {
  return lives.reduce((max, l) => Math.max(max, l.id), 0) + 1;
}

export function getMockLives(): LiveSession[] {
  return readAll();
}

export type NewLiveInput = {
  title: string;
  hostId: number;
  host: { fullName: string; avatarColor: string };
  scheduledAt: string;
  status: LiveStatus;
  videoUrl: string | null;
  topics: string[];
};

export function createLive(data: NewLiveInput): LiveSession {
  const lives = readAll();
  const live: LiveSession = {
    ...data,
    id: nextId(lives),
    viewerCount: 0,
    createdAt: new Date().toISOString(),
  };
  writeAll([...lives, live]);
  return live;
}