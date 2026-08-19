import { apiRequest } from "../api";

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

export function getMe() {
  return apiRequest<UserProfile>(users_endpoints.me);
}

export function updateMe(params: UpdateProfileParams) {
  return apiRequest<UserProfile, UpdateProfileParams>(users_endpoints.me, {
    method: "PATCH",
    body: params,
  });
}
