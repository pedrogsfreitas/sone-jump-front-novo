import { getCurrentUser } from "../mock/mock-users-db";
import { advanceNode, confirmNodeStudy, generateRoadmap, getUserRoadmap, gradeNodeQuiz } from "../mock/mock-roadmap-db";

// Endpoints reais (voltam a ser usados quando o back for plugado de novo):
// GET   /api/roadmap
// PATCH /api/roadmap/nodes/:id

export type RoadmapNodeStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

export type RoadmapNodeQuizOption = {
  id: string;
  text: string;
};

export type RoadmapNodeQuizQuestion = {
  id: string;
  prompt: string;
  options: RoadmapNodeQuizOption[];
  correctOptionId: string;
};

export type RoadmapNode = {
  id: string;
  name: string;
  category: string;
  hours: number;
  description: string;
  status: RoadmapNodeStatus;
  resources: { label: string; url: string | null }[];
  /** Quiz de validação da etapa — precisa acertar para poder concluir. */
  quiz: RoadmapNodeQuizQuestion[];
  /** Confirmação (autodeclarada) de que estudou o conteúdo da etapa. */
  studyConfirmed: boolean;
  /** Verdadeiro só depois de acertar o quiz da etapa. */
  quizPassed: boolean;
};

export type RoadmapCareer = {
  id: string;
  slug: string;
  title: string;
};

/**
 * Cada carreira tem o seu próprio roadmap, então a resposta diz de qual carreira é o
 * grafo. `career: null` (com `nodes: []`) é o usuário que ainda não escolheu carreira —
 * é um estado normal, não um erro de carregamento.
 */
export type Roadmap = {
  career: RoadmapCareer | null;
  nodes: RoadmapNode[];
};

/** Nível informado no quiz de carreira — usado para gerar o roadmap já com
 * um pedaço concluído para quem diz ter mais experiência. */
export type CareerLevel = "iniciante" | "basico" | "experiente" | "senior";

// MOCK: sem back-end no momento — lê o roadmap do usuário logado na base
// local (ver mock-roadmap-db.ts). Sem carreira escolhida ainda, devolve
// career: null / nodes: [] — a tela já trata esse estado normalmente.
export async function getRoadmap(): Promise<Roadmap> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = getCurrentUser();
  return getUserRoadmap(user.id);
}

// MOCK: gera o roadmap da carreira escolhida para o usuário logado. Usado
// tanto pela escolha direta (ChooseCareer.tsx) quanto pelo quiz (CareerQuiz.tsx).
export async function chooseCareer(careerSlug: string, level: CareerLevel): Promise<Roadmap> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const user = getCurrentUser();
  return generateRoadmap(user.id, careerSlug, level);
}

// MOCK: avança o status de uma etapa do roadmap do usuário logado.
export async function updateNodeStatus(nodeId: string, status: "IN_PROGRESS" | "COMPLETED"): Promise<Roadmap> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = getCurrentUser();
  return advanceNode(user.id, nodeId, status);
}

// MOCK: marca que o usuário estudou o conteúdo da etapa (autodeclarado —
// ainda não está ligado a uma marcação real do Catálogo).
export async function confirmStudy(nodeId: string): Promise<Roadmap> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const user = getCurrentUser();
  return confirmNodeStudy(user.id, nodeId);
}

// MOCK: corrige o quiz da etapa. `passed` só vem true se acertou tudo.
export async function submitNodeQuiz(
  nodeId: string,
  answers: Record<string, string>,
): Promise<{ passed: boolean; roadmap: Roadmap }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const user = getCurrentUser();
  return gradeNodeQuiz(user.id, nodeId, answers);
}