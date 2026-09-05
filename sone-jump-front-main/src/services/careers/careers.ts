import { getMockCareers } from "../mock/mock-careers-db";

// Endpoint real (volta a ser usado quando o back for plugado de novo):
// GET /api/careers

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

// MOCK: sem back-end no momento — dados em services/mock/mock-careers-db.ts.
// Continua "pública" (Explore.tsx e a tela de escolha de carreira dentro do
// app usam a mesma função).
export async function getCareers(): Promise<Career[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getMockCareers();
}