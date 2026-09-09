import { ApiError } from "../api";
import { getCurrentUser } from "../mock/mock-users-db";
import { createMockGoal, deleteMockGoal, getMockGoals, updateMockGoal } from "../mock/mock-goals-db";

// Endpoints reais (voltam a ser usados quando o back for plugado de novo):
// GET    /api/progress/goals
// POST   /api/progress/goals
// PATCH  /api/progress/goals/:id
// DELETE /api/progress/goals/:id

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

// MOCK: sem back-end no momento — dados em services/mock/mock-goals-db.ts.
export async function getGoals(): Promise<Goal[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = getCurrentUser();
  return getMockGoals(user.id);
}

export async function createGoal(params: { title: string; targetPct?: number; dueDate?: string }): Promise<Goal> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = getCurrentUser();
  return createMockGoal(user.id, params);
}

export async function updateGoal(goalId: number, currentPct: number): Promise<Goal> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const user = getCurrentUser();
  const updated = updateMockGoal(user.id, goalId, currentPct);
  if (!updated) throw new ApiError("Meta não encontrada.", 404);
  return updated;
}

export async function deleteGoal(goalId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const user = getCurrentUser();
  deleteMockGoal(user.id, goalId);
}
