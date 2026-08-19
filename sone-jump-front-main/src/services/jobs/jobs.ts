import { apiRequest } from "../api";

const jobs_endpoints = {
  list: "/api/jobs",
  applications: "/api/jobs/applications",
  apply: (id: number) => `/api/jobs/${id}/apply`,
};

export type RemoteType = "REMOTO" | "HIBRIDO" | "PRESENCIAL";

export type JobPartner = { id: number; name: string; logoUrl: string | null };

export type Job = {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  remoteType: RemoteType;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  skills: string[];
  partner: JobPartner | null;
  match: number | null;
};

export type JobApplication = {
  id: number;
  jobId: number;
  userId: number;
  status: string;
  appliedAt: string;
  job: { id: number; title: string; companyName: string };
};

export function getJobs(filters?: { remoteType?: RemoteType }) {
  const params = new URLSearchParams();
  if (filters?.remoteType) params.set("remoteType", filters.remoteType);
  const query = params.toString();
  return apiRequest<Job[]>(`${jobs_endpoints.list}${query ? `?${query}` : ""}`);
}

export function applyToJob(jobId: number) {
  return apiRequest<JobApplication>(jobs_endpoints.apply(jobId), { method: "POST" });
}

export function getMyApplications() {
  return apiRequest<JobApplication[]>(jobs_endpoints.applications);
}
