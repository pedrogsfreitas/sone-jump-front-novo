import { apiRequest } from "../api";

const careers_endpoints = {
  list: "/api/careers",
};

export type DemandLevel = "BAIXA" | "MEDIA" | "ALTA";

export type Career = {
  id: string;
  title: string;
  iconKey: string;
  salaryMin: number;
  salaryMax: number;
  avgMonthsMin: number;
  avgMonthsMax: number;
  description: string;
  jobsDemandLevel: DemandLevel;
  difficultyLevel: DemandLevel;
};

/** Public endpoint — used both pre-login (Explore.tsx) and inside the app. */
export function getCareers() {
  return apiRequest<Career[]>(careers_endpoints.list);
}
