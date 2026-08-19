import { apiRequest } from "../api";

const skills_endpoints = {
  progress: "/api/skills/progress",
  employabilityScore: "/api/skills/employability-score",
  challenges: "/api/skills/challenges",
  completeChallenge: (id: number) => `/api/skills/challenges/${id}/complete`,
  portfolio: "/api/skills/portfolio",
  portfolioItem: (id: number) => `/api/skills/portfolio/${id}`,
  certifications: "/api/skills/certifications",
};

export type Challenge = {
  id: number;
  title: string;
  difficulty: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  xpReward: number;
  timeLabel: string;
  description: string;
  tags: string[];
  completed: boolean;
};

export type PortfolioProject = {
  id: number;
  userId: number;
  title: string;
  stackTags: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  createdAt: string;
};

export type Certification = {
  id: number;
  name: string;
  description: string | null;
  earned: boolean;
  earnedAt: string | null;
};

export type EmployabilityScore = {
  score: number;
  certifications: number;
  challengesCompleted: number;
  portfolioProjects: number;
  roadmapCompleted: number;
};

export function getSkillProgress() {
  return apiRequest<{ name: string; pct: number }[]>(skills_endpoints.progress);
}

export function getEmployabilityScore() {
  return apiRequest<EmployabilityScore>(skills_endpoints.employabilityScore);
}

export function getChallenges() {
  return apiRequest<Challenge[]>(skills_endpoints.challenges);
}

export function completeChallenge(id: number) {
  return apiRequest<{ completed: true }>(skills_endpoints.completeChallenge(id), {
    method: "POST",
  });
}

export function getPortfolio() {
  return apiRequest<PortfolioProject[]>(skills_endpoints.portfolio);
}

export function createPortfolioProject(params: {
  title: string;
  stackTags: string[];
  githubUrl?: string;
  demoUrl?: string;
}) {
  return apiRequest<PortfolioProject, typeof params>(skills_endpoints.portfolio, {
    method: "POST",
    body: params,
  });
}

export function deletePortfolioProject(id: number) {
  return apiRequest<void>(skills_endpoints.portfolioItem(id), { method: "DELETE" });
}

export function getCertifications() {
  return apiRequest<Certification[]>(skills_endpoints.certifications);
}
