import { apiRequest } from "../api";

const users_endpoints = {
  me: "/api/users/me",
  password: "/api/users/me/password",
};

export type Role = "STUDENT" | "MENTOR" | "ADMIN";

export type UserProfile = {
  id: number;
  email: string;
  username: string;
  fullName: string;
  phone: string;
  role: Role;
  bio: string | null;
  headline: string | null;
  location: string | null;
  avatarColor: string;
  focusMode: boolean;
  xpTotal: number;
  level: number;
  streakCurrentDays: number;
  streakLongestDays: number;
  createdAt: string;
  /** Falso enquanto o e-mail do cadastro não foi confirmado. */
  emailVerified: boolean;
  lastAccessAt: string | null;
  cpf: string;
};

export type UpdateProfileParams = Partial<{
  username: string;
  bio: string;
  avatarColor: string;
  focusMode: boolean;
}>;

export function getMe() {
  return apiRequest<UserProfile>(users_endpoints.me);
}

export function updateMe(params: UpdateProfileParams) {
  return apiRequest<UserProfile, UpdateProfileParams>(users_endpoints.me, {
    method: "PATCH",
    body: params,
  });
}

/**
 * Troca a senha de quem está logado. O servidor revoga TODAS as sessões, inclusive a
 * atual — por isso a resposta é vazia e a tela precisa mandar a pessoa fazer login
 * de novo.
 */
export function changePassword(params: { currentPassword: string; newPassword: string }) {
  return apiRequest<void, typeof params>(users_endpoints.password, {
    method: "PATCH",
    body: params,
  });
}
