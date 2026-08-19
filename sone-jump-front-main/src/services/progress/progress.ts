import { apiRequest } from "../api";

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

export function getSummary() {
  return apiRequest<ProgressSummary>(progress_endpoints.summary);
}

export function getSessions() {
  return apiRequest<StudySession[]>(progress_endpoints.sessions);
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
