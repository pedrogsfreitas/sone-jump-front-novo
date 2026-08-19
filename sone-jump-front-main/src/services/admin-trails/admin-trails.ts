import { apiRequest } from "../api";

const admin_trails_endpoints = {
  list: "/api/admin/trails",
  detail: (id: number) => `/api/admin/trails/${id}`,
  modules: (id: number) => `/api/admin/trails/${id}/modules`,
  module: (moduleId: number) => `/api/admin/trails/modules/${moduleId}`,
};

export type TrailModule = {
  id: number;
  trailId: number;
  title: string;
  durationMinutes: number;
  lessons: number;
  orderIndex: number;
};

export type Trail = {
  id: number;
  name: string;
  category: string;
  active: boolean;
  createdAt: string;
  modules: TrailModule[];
  // Not wired to real per-user tracking yet — always 0 until built (see README).
  enrolled: number;
  completion: number;
};

export function getTrails() {
  return apiRequest<Trail[]>(admin_trails_endpoints.list);
}

export function createTrail(input: { name: string; category: string; active?: boolean }) {
  return apiRequest<Trail>(admin_trails_endpoints.list, { method: "POST", body: input });
}

export function updateTrail(id: number, input: { name?: string; category?: string; active?: boolean }) {
  return apiRequest<Trail>(admin_trails_endpoints.detail(id), { method: "PATCH", body: input });
}

export function deleteTrail(id: number) {
  return apiRequest<void>(admin_trails_endpoints.detail(id), { method: "DELETE" });
}

export function addTrailModule(trailId: number, input: { title: string; durationMinutes: number; lessons: number }) {
  return apiRequest<TrailModule>(admin_trails_endpoints.modules(trailId), { method: "POST", body: input });
}

export function removeTrailModule(moduleId: number) {
  return apiRequest<void>(admin_trails_endpoints.module(moduleId), { method: "DELETE" });
}
