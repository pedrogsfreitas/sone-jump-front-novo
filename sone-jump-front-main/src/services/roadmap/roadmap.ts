import { apiRequest } from "../api";

const roadmap_endpoints = {
  list: "/api/roadmap",
  node: (id: string) => `/api/roadmap/nodes/${id}`,
  confirmStudy: (id: string) => `/api/roadmap/nodes/${id}/confirm-study`,
  quiz: (id: string) => `/api/roadmap/nodes/${id}/quiz`,
  career: "/api/users/me/career",
};

export type RoadmapNodeStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

export type RoadmapNodeQuizOption = {
  id: string;
  text: string;
};

/**
 * Note que não existe `correctOptionId`: a correção acontece no servidor
 * (`POST /api/roadmap/nodes/:id/quiz`), que devolve só `passed`. Enquanto o quiz era
 * mockado, a resposta certa vinha junto no bundle e dava para lê-la no DevTools — e é
 * ela que decide se a etapa pode ser concluída.
 */
export type RoadmapNodeQuizQuestion = {
  id: string;
  prompt: string;
  options: RoadmapNodeQuizOption[];
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

/** Nível informado no quiz de carreira, na grafia usada pelas telas. */
export type CareerLevel = "iniciante" | "basico" | "experiente" | "senior";

/** O back usa o enum `OnboardingLevel`, em maiúsculas. */
const LEVEL_TO_API: Record<CareerLevel, string> = {
  iniciante: "INICIANTE",
  basico: "BASICO",
  experiente: "EXPERIENTE",
  senior: "SENIOR",
};

export function getRoadmap() {
  return apiRequest<Roadmap>(roadmap_endpoints.list);
}

/**
 * Escolhe (ou troca) a carreira e devolve o roadmap resultante.
 *
 * São duas chamadas porque são duas responsabilidades: a carreira é um campo do
 * perfil, o roadmap é um recurso próprio. `level` é opcional — a escolha direta não
 * pergunta o nível, e mandar um valor padrão ali apagaria o que a pessoa informou
 * antes no quiz.
 */
export async function chooseCareer(
  careerSlug: string,
  level?: CareerLevel,
): Promise<Roadmap> {
  await apiRequest(roadmap_endpoints.career, {
    method: "PUT",
    body: { careerSlug, ...(level && { level: LEVEL_TO_API[level] }) },
  });
  return getRoadmap();
}

export function updateNodeStatus(nodeId: string, status: "IN_PROGRESS" | "COMPLETED") {
  return apiRequest<Roadmap, { status: string }>(roadmap_endpoints.node(nodeId), {
    method: "PATCH",
    body: { status },
  });
}

/** Metade do que o servidor exige para aceitar a conclusão; a outra é o quiz. */
export function confirmStudy(nodeId: string) {
  return apiRequest<Roadmap>(roadmap_endpoints.confirmStudy(nodeId), {
    method: "POST",
  });
}

export type QuizResult = {
  passed: boolean;
  /** Quantas acertou. Vem também na reprovação — sem isso, refazer vira tentativa às cegas. */
  correctCount: number;
  total: number;
  /** Acertos necessários para passar. Calculado no servidor, nunca no cliente. */
  minimumCorrect: number;
  roadmap: Roadmap;
};

/**
 * Manda `perguntaId -> opcaoId` e recebe o placar agregado. QUAIS questões foram
 * erradas nunca vem: revelaria a alternativa certa por eliminação em poucas
 * tentativas.
 */
export function submitNodeQuiz(nodeId: string, answers: Record<string, string>) {
  return apiRequest<QuizResult, { answers: Record<string, string> }>(
    roadmap_endpoints.quiz(nodeId),
    { method: "POST", body: { answers } },
  );
}
