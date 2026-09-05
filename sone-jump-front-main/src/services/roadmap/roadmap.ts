import { apiRequest } from "../api";

const roadmap_endpoints = {
  list: "/api/roadmap",
  nodeStatus: (id: string) => `/api/roadmap/nodes/${id}`,
};

export type RoadmapNodeStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

export type RoadmapNode = {
  id: string;
  name: string;
  category: string;
  hours: number;
  description: string;
  status: RoadmapNodeStatus;
  resources: { label: string; url: string | null }[];
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

// MOCK: sem back-end no momento. Ainda não existe seleção de carreira
// mockada, então todo usuário começa sem carreira escolhida — a tela já
// trata esse estado (mostra o card "Comece por aqui" / "Escolha sua carreira").
export async function getRoadmap(): Promise<Roadmap> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { career: null, nodes: [] };
}

export function updateNodeStatus(nodeId: string, status: "IN_PROGRESS" | "COMPLETED") {
  return apiRequest<Roadmap, { status: string }>(roadmap_endpoints.nodeStatus(nodeId), {
    method: "PATCH",
    body: { status },
  });
}