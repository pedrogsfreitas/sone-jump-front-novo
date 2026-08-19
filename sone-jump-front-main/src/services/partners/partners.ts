import { apiRequest } from "../api";

const partners_endpoints = {
  list: "/api/partners",
};

export type PartnerType = "CONTEUDO" | "VAGAS" | "CERTIFICACAO" | "API" | "MENTORIA";

export type Partner = {
  id: number;
  name: string;
  logoUrl: string | null;
  type: PartnerType;
  status: "PENDENTE" | "ATIVO" | "INATIVO";
  description: string;
  since: string | null;
  createdAt: string;
};

export function getPartners() {
  return apiRequest<Partner[]>(partners_endpoints.list);
}
