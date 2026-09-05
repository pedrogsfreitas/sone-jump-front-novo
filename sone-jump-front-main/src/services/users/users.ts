import { apiRequest } from "../api";
import { updateCurrentUser } from "../mock/mock-users-db";

const users_endpoints = {
  me: "/api/users/me",
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
  lastAccessAt: string | null;
  cpf: string;
};

export type UpdateProfileParams = Partial<{
  username: string;
  bio: string;
  avatarColor: string;
  focusMode: boolean;
}>;

// MOCK: sem back-end no momento — monta o perfil a partir do usuário logado
// na base local (ver mock-users-db.ts) e atualiza o "último acesso".
export async function getMe(): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = updateCurrentUser({ lastAccessAt: new Date().toISOString() });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullname,
    phone: user.phone,
    role: user.role,
    bio: user.bio,
    headline: user.headline,
    location: user.location,
    avatarColor: user.avatarColor,
    focusMode: user.focusMode,
    xpTotal: user.xpTotal,
    level: user.level,
    streakCurrentDays: user.streakCurrentDays,
    streakLongestDays: user.streakLongestDays,
    createdAt: user.createdAt,
    lastAccessAt: user.lastAccessAt,
    cpf: user.cpf,
  };
}

export function updateMe(params: UpdateProfileParams) {
  return apiRequest<UserProfile, UpdateProfileParams>(users_endpoints.me, {
    method: "PATCH",
    body: params,
  });
}