import { apiRequest } from "../api";

const plans_endpoints = {
  list: "/api/plans",
};

export type PlanKey = "FREE" | "PRO" | "PREMIUM";

export type Plan = {
  id: number;
  key: PlanKey;
  name: string;
  priceMonthlyCents: number;
  priceAnnualCents: number;
  features: string[];
};

export function getPlans() {
  return apiRequest<Plan[]>(plans_endpoints.list);
}
