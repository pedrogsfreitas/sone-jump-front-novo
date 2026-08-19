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

export function getRoadmap() {
  return apiRequest<RoadmapNode[]>(roadmap_endpoints.list);
}

export function updateNodeStatus(nodeId: string, status: "IN_PROGRESS" | "COMPLETED") {
  return apiRequest<RoadmapNode[], { status: string }>(roadmap_endpoints.nodeStatus(nodeId), {
    method: "PATCH",
    body: { status },
  });
}
