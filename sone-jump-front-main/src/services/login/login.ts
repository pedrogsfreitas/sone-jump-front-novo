import { apiRequest } from "../api";

const login_endpoints = {
    register: "/api/login/register",
    login: "/api/login/authenticate",
};

export type RegisterParams = {
  email: string;
  username: string;
  password: string;
  fullname: string;
  cpf: string;
  phone: string;
};

export type AuthParams = {
    username: string;
    password: string;
};

export type RegisterResponse = {
    id: number;
    message: string;
};

export type AuthResponse = {
    id: number;
    token: string;
};

export function register(params: RegisterParams) {  
    return apiRequest<RegisterResponse, RegisterParams>(login_endpoints.register, {
        method: "POST",
        body: params,
    });
}

export function login(params: AuthParams) {
    return apiRequest<AuthResponse, AuthParams>(login_endpoints.login, {
        method: "POST",
        body: params,
    });
}
