import { apiRequest } from "../api";

const admin_users_endpoints = {
  list: "/api/admin/users",
  stats: "/api/admin/users/stats",
  role: (id: number) => `/api/admin/users/${id}/role`,
  active: (id: number) => `/api/admin/users/${id}/active`,
};

export type Role = "STUDENT" | "MENTOR" | "ADMIN";
export type PlanKey = "FREE" | "PRO" | "PREMIUM";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  avatarColor: string;
  plan: PlanKey;
  registeredAt: string;
  lastAccessAt: string | null;
};

export type AdminUserStats = {
  total: number;
  active: number;
  inactive: number;
  newLast30Days: number;
};

export type AdminUserStatus = "ATIVO" | "INATIVO";

export type ListAdminUsersParams = {
  search?: string;
  status?: AdminUserStatus;
  plan?: PlanKey;
  limit?: number;
  offset?: number;
};

/** `total` conta tudo que casa com o filtro, não só o que veio nesta página. */
export type Paginated<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * Busca, filtros e paginação são todos do servidor. Filtrar no cliente uma página de
 * 20 linhas esconderia usuários que casam com o filtro só por estarem fora da página
 * carregada — e o "de N usuários" no rodapé mentiria.
 */
export function getAdminUsers(params: ListAdminUsersParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const suffix = query.toString() ? `?${query}` : "";
  return apiRequest<Paginated<AdminUser>>(`${admin_users_endpoints.list}${suffix}`);
}

export function getAdminUserStats() {
  return apiRequest<AdminUserStats>(admin_users_endpoints.stats);
}

export function updateUserRole(id: number, role: Role) {
  return apiRequest<AdminUser>(admin_users_endpoints.role(id), {
    method: "PATCH",
    body: { role },
  });
}

export function updateUserActive(id: number, active: boolean) {
  return apiRequest<AdminUser>(admin_users_endpoints.active(id), {
    method: "PATCH",
    body: { active },
  });
}
