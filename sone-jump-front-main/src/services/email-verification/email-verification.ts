import { apiRequest } from "../api";

const email_verification_endpoints = {
  verify: "/api/auth/verify-email",
  resend: "/api/auth/resend-verification",
};

/**
 * Público: quem clica no link do e-mail pode não estar logado, ou estar em outro
 * dispositivo. O token é a credencial aqui.
 */
export function verifyEmail(token: string) {
  return apiRequest<void, { token: string }>(email_verification_endpoints.verify, {
    method: "POST",
    body: { token },
  });
}

/** Exige sessão — reenvia para o e-mail do próprio usuário e de mais ninguém. */
export function resendVerification() {
  return apiRequest<void>(email_verification_endpoints.resend, { method: "POST" });
}
