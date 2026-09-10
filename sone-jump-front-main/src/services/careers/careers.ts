import { apiRequest } from "../api";

const careers_endpoints = {
  list: "/api/careers",
};

export type DemandLevel = "BAIXA" | "MEDIA" | "ALTA";

export type Career = {
  id: string;
  title: string;
  /** Chave estável da carreira: identifica o roadmap dela na URL e na importação. */
  slug: string;
  iconKey: string;
  salaryMin: number;
  salaryMax: number;
  avgMonthsMin: number;
  avgMonthsMax: number;
  description: string;
  jobsDemandLevel: DemandLevel;
  difficultyLevel: DemandLevel;
};

/**
 * Endpoint público (sem `JwtAuthGuard`): a landing `/explore` mostra as carreiras
 * antes do cadastro, e a tela de escolha dentro do app usa a mesma função.
 */
export function getCareers() {
  return apiRequest<Career[]>(careers_endpoints.list);
}
