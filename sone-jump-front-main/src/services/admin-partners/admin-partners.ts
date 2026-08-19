import { apiRequest } from "../api";

const admin_partners_endpoints = {
  list: "/api/admin/partners",
  detail: (id: number) => `/api/admin/partners/${id}`,
};

export type IntegrationType = "CONTEUDO" | "VAGAS" | "CERTIFICACAO" | "API" | "MENTORIA";
export type PartnerStatus = "ATIVO" | "INATIVO" | "PENDENTE";

export type AdminPartner = {
  id: number;
  name: string;
  logoUrl: string | null;
  type: IntegrationType;
  status: PartnerStatus;
  description: string;
  since: string | null;
  createdAt: string;
};

export type PartnerInput = {
  name: string;
  type: IntegrationType;
  status?: PartnerStatus;
  description: string;
  logoUrl?: string;
};

export function getAdminPartners() {
  return apiRequest<AdminPartner[]>(admin_partners_endpoints.list);
}

export function createPartner(input: PartnerInput) {
  return apiRequest<AdminPartner>(admin_partners_endpoints.list, { method: "POST", body: input });
}

export function updatePartner(id: number, input: Partial<PartnerInput>) {
  return apiRequest<AdminPartner>(admin_partners_endpoints.detail(id), { method: "PATCH", body: input });
}

export function deletePartner(id: number) {
  return apiRequest<void>(admin_partners_endpoints.detail(id), { method: "DELETE" });
}
