import { apiRequest } from "../api";
import type { JobApplicationStatus, RemoteType } from "../jobs/jobs";

const admin_jobs_endpoints = {
  list: "/api/admin/jobs",
  job: (id: number) => `/api/admin/jobs/${id}`,
  applications: (jobId: number) => `/api/admin/jobs/${jobId}/applications`,
  application: (id: number) => `/api/admin/jobs/applications/${id}`,
};

export type AdminJob = {
  id: number;
  title: string;
  companyName: string;
  location: string;
  remoteType: RemoteType;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  partner: { id: number; name: string } | null;
  skills: { skill: { id: number; name: string } }[];
  createdAt: string;
};

/** Só os campos que a tela mostra — a linha do `User` nunca vem inteira do servidor. */
export type JobApplicant = {
  id: number;
  status: JobApplicationStatus;
  appliedAt: string;
  user: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    avatarColor: string;
  };
};

export function getAdminJobs() {
  return apiRequest<AdminJob[]>(admin_jobs_endpoints.list);
}

export function getJobApplicants(jobId: number) {
  return apiRequest<JobApplicant[]>(admin_jobs_endpoints.applications(jobId));
}

/**
 * Move a candidatura no funil. Antes deste endpoint, `status` era um campo que
 * ninguém conseguia alterar: toda candidatura ficava em `APLICADO` para sempre.
 */
export function updateApplicationStatus(
  applicationId: number,
  status: JobApplicationStatus,
) {
  return apiRequest<JobApplicant, { status: JobApplicationStatus }>(
    admin_jobs_endpoints.application(applicationId),
    { method: "PATCH", body: { status } },
  );
}

export function deleteAdminJob(jobId: number) {
  return apiRequest<void>(admin_jobs_endpoints.job(jobId), { method: "DELETE" });
}
