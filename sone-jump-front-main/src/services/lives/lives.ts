import { apiRequest } from "../api";
import { getMockLives } from "../mock/mock-lives-db";

const lives_endpoints = {
  list: "/api/lives",
  recordings: "/api/lives/recordings",
  questions: (liveId: number) => `/api/lives/${liveId}/questions`,
  upvote: (questionId: number) => `/api/lives/questions/${questionId}/upvote`,
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

export type Recording = {
  id: number;
  title: string;
  videoUrl: string;
  viewCount: number;
  durationMinutes: number;
  createdAt: string;
};

export type LiveQuestion = {
  id: number;
  liveSessionId: number;
  userId: number;
  text: string;
  votes: number;
  createdAt: string;
  user: { username: string };
};

// MOCK: sem back-end no momento — dados em services/mock/mock-lives-db.ts.
export async function getLives(): Promise<LiveSession[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getMockLives();
}

export function getRecordings() {
  return apiRequest<Recording[]>(lives_endpoints.recordings);
}

export function getQuestions(liveId: number) {
  return apiRequest<LiveQuestion[]>(lives_endpoints.questions(liveId));
}

export function addQuestion(liveId: number, text: string) {
  return apiRequest<LiveQuestion>(lives_endpoints.questions(liveId), {
    method: "POST",
    body: { text },
  });
}

export function upvoteQuestion(questionId: number) {
  return apiRequest<LiveQuestion>(lives_endpoints.upvote(questionId), { method: "PUT" });
}