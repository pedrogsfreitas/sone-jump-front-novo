import { apiRequest } from "../api";

const lives_endpoints = {
  list: "/api/lives",
};

export type LiveStatus = "AGENDADA" | "AO_VIVO" | "ENCERRADA";

export type LiveSession = {
  id: number;
  title: string;
  hostId: number;
  host: { fullName: string; avatarColor: string };
  scheduledAt: string;
  status: LiveStatus;
  videoUrl: string | null;
  viewerCount: number;
  topics: string[];
  createdAt: string;
};

/** Full lives module (recordings, Q&A, host actions) is Fase 7c — this covers
 * only what the Dashboard's "Próxima Sessão ao Vivo" card needs today. */
export function getLives() {
  return apiRequest<LiveSession[]>(lives_endpoints.list);
}
