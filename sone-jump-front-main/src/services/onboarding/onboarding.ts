import { apiRequest } from "../api";

const onboarding_endpoints = {
  root: "/api/onboarding",
};

export type OnboardingGoal = "PRIMEIRO_EMPREGO" | "TRANSICAO" | "EVOLUCAO" | "FREELANCER";
export type OnboardingArea =
  | "FRONTEND"
  | "BACKEND"
  | "DATA_SCIENCE"
  | "DEVOPS"
  | "MOBILE"
  | "UX_UI";
export type OnboardingLevel = "INICIANTE" | "BASICO" | "EXPERIENTE" | "SENIOR";
export type OnboardingWeeklyTime = "H2_4" | "H5_8" | "H9_15" | "H15_PLUS";

export type OnboardingProfile = {
  userId: number;
  goal: OnboardingGoal;
  area: OnboardingArea;
  level: OnboardingLevel;
  weeklyTime: OnboardingWeeklyTime;
  careerId: string | null;
  createdAt: string;
};

export type SaveOnboardingParams = {
  goal: OnboardingGoal;
  area: OnboardingArea;
  level: OnboardingLevel;
  weeklyTime: OnboardingWeeklyTime;
  careerSlug?: string;
};

/**
 * Ids das opções da tela → enums do banco.
 *
 * As áreas usam a mesma grafia curta que o `Career.slug`, então o id escolhido serve
 * de `careerSlug` sem tradução — foi para isso que os slugs foram unificados.
 */
export const GOAL_TO_API: Record<string, OnboardingGoal> = {
  "primeiro-emprego": "PRIMEIRO_EMPREGO",
  transicao: "TRANSICAO",
  evolucao: "EVOLUCAO",
  freelancer: "FREELANCER",
};

export const AREA_TO_API: Record<string, OnboardingArea> = {
  frontend: "FRONTEND",
  backend: "BACKEND",
  "data-science": "DATA_SCIENCE",
  devops: "DEVOPS",
  mobile: "MOBILE",
  "ux-ui": "UX_UI",
};

export const LEVEL_TO_API: Record<string, OnboardingLevel> = {
  iniciante: "INICIANTE",
  basico: "BASICO",
  experiente: "EXPERIENTE",
  senior: "SENIOR",
};

export const WEEKLY_TIME_TO_API: Record<string, OnboardingWeeklyTime> = {
  "2-4h": "H2_4",
  "5-8h": "H5_8",
  "9-15h": "H9_15",
  "15h+": "H15_PLUS",
};

/** Um perfil por usuário: refazer o questionário sobrescreve o anterior. */
export function saveOnboarding(params: SaveOnboardingParams) {
  return apiRequest<OnboardingProfile, SaveOnboardingParams>(onboarding_endpoints.root, {
    method: "POST",
    body: params,
  });
}

export function getOnboarding() {
  return apiRequest<OnboardingProfile | null>(onboarding_endpoints.root);
}
