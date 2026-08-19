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

export function getAdminUsers(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest<AdminUser[]>(`${admin_users_endpoints.list}${query}`);
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
