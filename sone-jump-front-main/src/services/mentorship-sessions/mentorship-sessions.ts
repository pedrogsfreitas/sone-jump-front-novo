import { apiRequest } from "../api";

const sessions_endpoints = {
  base: "/api/mentorship-sessions",
  mine: "/api/mentorship-sessions/mine",
  cancel: (id: number) => `/api/mentorship-sessions/${id}/cancel`,
};

export type MentorshipStatus = "SOLICITADA" | "CONFIRMADA" | "CONCLUIDA" | "CANCELADA";

export type MentorshipSession = {
  id: number;
  mentorId: number;
  menteeId: number;
  scheduledAt: string;
  durationMinutes: number;
  status: MentorshipStatus;
  meetingUrl: string | null;
  topic: string | null;
  createdAt: string;
  mentor: { user: { fullName: string; avatarColor: string } };
};

export function requestSession(input: { mentorId: number; scheduledAt: string; topic?: string }) {
  return apiRequest<MentorshipSession>(sessions_endpoints.base, { method: "POST", body: input });
}

export function getMySessions() {
  return apiRequest<MentorshipSession[]>(sessions_endpoints.mine);
}

export function cancelSession(id: number) {
  return apiRequest<MentorshipSession>(sessions_endpoints.cancel(id), { method: "PATCH" });
}
