import { apiRequest } from "../api";

const password_reset_endpoints = {
  forgot: "/api/auth/forgot-password",
  reset: "/api/auth/reset-password",
};

/**
 * O servidor responde 204 exista o e-mail ou não — de propósito, para o endpoint não
 * virar um verificador de quem tem conta. A tela deve mostrar a mesma mensagem nos
 * dois casos; não há como (nem por que) distinguir aqui.
 */
export function requestPasswordReset(email: string) {
  return apiRequest<void, { email: string }>(password_reset_endpoints.forgot, {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(token: string, password: string) {
  return apiRequest<void, { token: string; password: string }>(
    password_reset_endpoints.reset,
    { method: "POST", body: { token, password } },
  );
}
