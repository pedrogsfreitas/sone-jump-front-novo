import { apiRequest } from "../api";

const admin_reports_endpoints = {
  dashboard: "/api/admin/reports/dashboard",
  overview: "/api/admin/reports/overview",
  funnel: "/api/admin/reports/funnel",
  cohorts: "/api/admin/reports/cohorts",
};

export type ActivityEvent = {
  type: "post" | "completion" | "registration";
  text: string;
  at: string;
};

export type AdminDashboard = {
  totalUsers: number;
  activeTrails: number;
  monthlyRevenueCents: number;
  conversionRate: number;
  monthlyGrowth: { month: string; users: number }[];
  recentActivity: ActivityEvent[];
};

export type AdminOverview = {
  newUsers: number;
  revenueCents: number;
  courseCompletions: number;
  avgContentRating: number;
};

// avgContentRating is a Prisma Decimal average — serializes to JSON as a string.
type RawAdminOverview = Omit<AdminOverview, "avgContentRating"> & { avgContentRating: number | string };

export type FunnelStep = { label: string; value: number; percent: number };

export type CohortRow = { label: string; values: (number | null)[] };

function dateRangeQuery(from?: string, to?: string): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboard>(admin_reports_endpoints.dashboard);
}

export async function getAdminOverview(from?: string, to?: string) {
  const overview = await apiRequest<RawAdminOverview>(
    `${admin_reports_endpoints.overview}${dateRangeQuery(from, to)}`,
  );
  return { ...overview, avgContentRating: Number(overview.avgContentRating) };
}

export function getAdminFunnel(from?: string, to?: string) {
  return apiRequest<FunnelStep[]>(`${admin_reports_endpoints.funnel}${dateRangeQuery(from, to)}`);
}

export function getAdminCohorts() {
  return apiRequest<CohortRow[]>(admin_reports_endpoints.cohorts);
}
