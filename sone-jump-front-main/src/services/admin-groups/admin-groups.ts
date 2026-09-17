import { apiRequest } from "../api";

const admin_groups_endpoints = {
  list: "/api/admin/groups",
  item: (id: number) => `/api/admin/groups/${id}`,
};

export type AdminGroup = {
  id: number;
  name: string;
  icon: string | null;
  membersCount: number;
  /** Publicações feitas dentro do grupo. Grupo com publicação não pode ser apagado. */
  postsCount: number;
};

export function getAdminGroups() {
  return apiRequest<AdminGroup[]>(admin_groups_endpoints.list);
}

export function createGroup(params: { name: string; icon?: string }) {
  return apiRequest<AdminGroup, typeof params>(admin_groups_endpoints.list, {
    method: "POST",
    body: params,
  });
}

export function updateGroup(id: number, params: { name?: string; icon?: string }) {
  return apiRequest<AdminGroup, typeof params>(admin_groups_endpoints.item(id), {
    method: "PATCH",
    body: params,
  });
}

export function deleteGroup(id: number) {
  return apiRequest<void>(admin_groups_endpoints.item(id), { method: "DELETE" });
}
