/**
 * MOCK DB — metas de progresso (fase sem back-end)
 * ---------------------------------------------------------------------------
 * Guarda as metas de cada usuário em localStorage. Começa vazia — sem
 * sistema de metas de verdade ainda, não faz sentido inventar metas de
 * exemplo pra quem acabou de criar a conta.
 */

import type { Goal } from "../progress/progress";

const STORAGE_KEY = "mock_goals_db";

function readAll(): Record<number, Goal[]> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Record<number, Goal[]>) : {};
    } catch {
        return {};
    }
}

function writeAll(all: Record<number, Goal[]>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function nextId(all: Record<number, Goal[]>): number {
    const every = Object.values(all).flat();
    return every.reduce((max, g) => Math.max(max, g.id), 0) + 1;
}

export function getMockGoals(userId: number): Goal[] {
    return readAll()[userId] ?? [];
}

export function createMockGoal(
    userId: number,
    params: { title: string; targetPct?: number; dueDate?: string },
): Goal {
    const all = readAll();
    const goal: Goal = {
        id: nextId(all),
        userId,
        title: params.title,
        targetPct: params.targetPct ?? 100,
        currentPct: 0,
        dueDate: params.dueDate ?? null,
        completedAt: null,
        createdAt: new Date().toISOString(),
    };
    all[userId] = [...(all[userId] ?? []), goal];
    writeAll(all);
    return goal;
}

export function updateMockGoal(userId: number, goalId: number, currentPct: number): Goal | null {
    const all = readAll();
    const goals = all[userId] ?? [];
    const idx = goals.findIndex((g) => g.id === goalId);
    if (idx === -1) return null;

    const clamped = Math.max(0, Math.min(100, currentPct));
    const updated: Goal = {
        ...goals[idx],
        currentPct: clamped,
        completedAt: clamped >= goals[idx].targetPct ? goals[idx].completedAt ?? new Date().toISOString() : null,
    };
    goals[idx] = updated;
    all[userId] = goals;
    writeAll(all);
    return updated;
}

export function deleteMockGoal(userId: number, goalId: number): void {
    const all = readAll();
    all[userId] = (all[userId] ?? []).filter((g) => g.id !== goalId);
    writeAll(all);
}