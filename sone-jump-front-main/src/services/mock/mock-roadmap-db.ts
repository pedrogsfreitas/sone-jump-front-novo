/**
 * MOCK DB — roadmap de cada usuário (fase sem back-end)
 * ---------------------------------------------------------------------------
 * Guarda, por usuário, qual carreira ele escolheu e o estado (status,
 * confirmação de estudo, resultado do quiz) de cada etapa do roadmap dela.
 * O "molde" das etapas (incluindo o quiz) vem de `mock-roadmap-templates.ts`;
 * aqui só vive a INSTÂNCIA de cada usuário.
 */

import type { CareerLevel, Roadmap, RoadmapNode, RoadmapNodeStatus } from "../roadmap/roadmap";
import { findMockCareerBySlug } from "./mock-careers-db";
import { findNodeTemplate, getRoadmapTemplate } from "./mock-roadmap-templates";

const STORAGE_KEY = "mock_roadmaps_db";

type StoredRoadmap = { careerSlug: string; nodes: RoadmapNode[] };

function readAll(): Record<number, StoredRoadmap> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, StoredRoadmap>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<number, StoredRoadmap>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Preenche campos que um roadmap salvo antes dessa etapa existir não tem
 * (quiz, studyConfirmed, quizPassed) — mesmo cuidado que já tomamos em
 * mock-users-db.ts: sem isso, quem já tinha gerado um roadmap antes desse
 * recurso existir quebraria a tela ao ler `undefined`.
 */
function normalizeNode(node: RoadmapNode, careerSlug: string): RoadmapNode {
  const template = findNodeTemplate(careerSlug, node.id);
  const alreadyDone = node.status === "COMPLETED";
  return {
    ...node,
    quiz: node.quiz ?? template?.quiz ?? [],
    studyConfirmed: node.studyConfirmed ?? alreadyDone,
    quizPassed: node.quizPassed ?? alreadyDone,
  };
}

function toRoadmap(stored: StoredRoadmap | undefined): Roadmap {
  if (!stored) return { career: null, nodes: [] };
  const career = findMockCareerBySlug(stored.careerSlug);
  if (!career) return { career: null, nodes: [] };
  const nodes = stored.nodes.map((n) => normalizeNode(n, stored.careerSlug));
  return { career: { id: career.id, slug: career.slug, title: career.title }, nodes };
}

export function getUserRoadmap(userId: number): Roadmap {
  return toRoadmap(readAll()[userId]);
}

// Quanto mais experiente a pessoa já diz ser, mais etapas iniciais entram
// prontas como concluídas — é o jeito do nível informado no quiz realmente
// mudar o roadmap gerado, e não só decorar a tela.
const COMPLETED_COUNT_BY_LEVEL: Record<CareerLevel, number> = {
  iniciante: 0,
  basico: 1,
  experiente: 2,
  senior: 3,
};

function buildNodes(careerSlug: string, level: CareerLevel): RoadmapNode[] {
  const template = getRoadmapTemplate(careerSlug) ?? [];
  const completedCount = Math.min(COMPLETED_COUNT_BY_LEVEL[level], template.length);

  return template.map((node, i): RoadmapNode => {
    let status: RoadmapNodeStatus;
    if (i < completedCount) status = "COMPLETED";
    else if (i === completedCount) status = "IN_PROGRESS";
    else status = "LOCKED";
    // Etapas que já nascem concluídas (pelo nível informado) já contam como
    // estudadas e com quiz passado — não faria sentido pedir pra refazer.
    const done = status === "COMPLETED";
    return { ...node, status, studyConfirmed: done, quizPassed: done };
  });
}

export function generateRoadmap(userId: number, careerSlug: string, level: CareerLevel): Roadmap {
  const nodes = buildNodes(careerSlug, level);
  const all = readAll();
  all[userId] = { careerSlug, nodes };
  writeAll(all);
  return toRoadmap(all[userId]);
}

/**
 * Atualiza o status de uma etapa. Ao concluir uma etapa, destrava
 * (LOCKED → AVAILABLE) a próxima da sequência — sem isso a pessoa concluiria
 * uma etapa e todo o resto continuaria bloqueado para sempre.
 */
export function advanceNode(userId: number, nodeId: string, status: "IN_PROGRESS" | "COMPLETED"): Roadmap {
  const all = readAll();
  const stored = all[userId];
  if (!stored) return { career: null, nodes: [] };

  const nodes = stored.nodes.map((n) => normalizeNode(n, stored.careerSlug));
  const idx = nodes.findIndex((n) => n.id === nodeId);
  if (idx === -1) return toRoadmap({ ...stored, nodes });

  nodes[idx] = { ...nodes[idx], status };

  if (status === "COMPLETED") {
    const next = nodes[idx + 1];
    if (next && next.status === "LOCKED") {
      nodes[idx + 1] = { ...next, status: "AVAILABLE" };
    }
  }

  all[userId] = { ...stored, nodes };
  writeAll(all);
  return toRoadmap(all[userId]);
}

/** Marca que o usuário estudou o conteúdo da etapa (autodeclarado). */
export function confirmNodeStudy(userId: number, nodeId: string): Roadmap {
  const all = readAll();
  const stored = all[userId];
  if (!stored) return { career: null, nodes: [] };

  const nodes = stored.nodes.map((n) => normalizeNode(n, stored.careerSlug));
  const idx = nodes.findIndex((n) => n.id === nodeId);
  if (idx === -1) return toRoadmap({ ...stored, nodes });

  nodes[idx] = { ...nodes[idx], studyConfirmed: true };
  all[userId] = { ...stored, nodes };
  writeAll(all);
  return toRoadmap(all[userId]);
}

/**
 * Corrige o quiz de uma etapa. Só marca `quizPassed: true` se acertou TODAS
 * as perguntas (hoje é só 1 por etapa, mas a correção já suporta mais).
 */
export function gradeNodeQuiz(
  userId: number,
  nodeId: string,
  answers: Record<string, string>,
): { passed: boolean; roadmap: Roadmap } {
  const all = readAll();
  const stored = all[userId];
  if (!stored) return { passed: false, roadmap: { career: null, nodes: [] } };

  const nodes = stored.nodes.map((n) => normalizeNode(n, stored.careerSlug));
  const idx = nodes.findIndex((n) => n.id === nodeId);
  if (idx === -1) return { passed: false, roadmap: toRoadmap({ ...stored, nodes }) };

  const node = nodes[idx];
  const passed = node.quiz.length > 0 && node.quiz.every((q) => answers[q.id] === q.correctOptionId);

  nodes[idx] = { ...node, quizPassed: passed || node.quizPassed };
  all[userId] = { ...stored, nodes };
  writeAll(all);
  return { passed, roadmap: toRoadmap(all[userId]) };
}