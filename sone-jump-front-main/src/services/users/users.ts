import { apiRequest } from "../api";

const users_endpoints = {
  userData: "/api/users/user",
};

export type UserDataParams = {
  id: number;
};

export type UserDataResponse = {
  email: string;
  username: string;
  fullname: string;
  cpf: string;
  phone: string;
};

export function getUserData(params: UserDataParams) {
  return apiRequest<UserDataResponse, UserDataParams>(users_endpoints.userData, {
    method: "POST",
    body: params,
  });
}