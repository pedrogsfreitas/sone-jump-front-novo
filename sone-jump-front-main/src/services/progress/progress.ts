import { apiRequest } from "../api";
import { getCurrentUser } from "../mock/mock-users-db";

const progress_endpoints = {
  summary: "/api/progress/summary",
  sessions: "/api/progress/sessions",
  goals: "/api/progress/goals",
  goal: (id: number) => `/api/progress/goals/${id}`,
};

export type ProgressSummary = {
  xpTotal: number;
  level: number;
  streakCurrentDays: number;
  streakLongestDays: number;
  sessionsThisWeek: number;
  skills: { name: string; pct: number }[];
};

export type StudySession = {
  id: number;
  userId: number;
  topic: string;
  occurredOn: string;
  durationMinutes: number;
  xpEarned: number;
  subjectTag: string | null;
  createdAt: string;
};

export type Goal = {
  id: number;
  userId: number;
  title: string;
  targetPct: number;
  currentPct: number;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
};

// MOCK: sem back-end no momento — resumo derivado direto do usuário logado.
// Não existe ainda um sistema de "skills em progresso" mockado, então entra
// vazio (a tela já trata esse caso: some o bloco "Habilidades em Progresso").
export async function getSummary(): Promise<ProgressSummary> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = getCurrentUser();

  return {
    xpTotal: user.xpTotal,
    level: user.level,
    streakCurrentDays: user.streakCurrentDays,
    streakLongestDays: user.streakLongestDays,
    sessionsThisWeek: 0,
    skills: [],
  };
}

// MOCK: sem back-end no momento — ainda não existe registro de sessões de
// estudo mockado, então começa vazio (usuário recém-criado não estudou nada).
export async function getSessions(): Promise<StudySession[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [];
}

export function getGoals() {
  return apiRequest<Goal[]>(progress_endpoints.goals);
}

export function createGoal(params: { title: string; targetPct?: number; dueDate?: string }) {
  return apiRequest<Goal, typeof params>(progress_endpoints.goals, {
    method: "POST",
    body: params,
  });
}

export function updateGoal(goalId: number, currentPct: number) {
  return apiRequest<Goal, { currentPct: number }>(progress_endpoints.goal(goalId), {
    method: "PATCH",
    body: { currentPct },
  });
}

export function deleteGoal(goalId: number) {
  return apiRequest<void>(progress_endpoints.goal(goalId), { method: "DELETE" });
}