import { apiRequest } from "../api";

const admin_content_endpoints = {
  list: "/api/admin/content",
  detail: (id: number) => `/api/admin/content/${id}`,
};

export type ContentType = "CURSO" | "VIDEO" | "ARTIGO" | "PROJETO";
export type ContentPlatform = "ALURA" | "UDEMY" | "YOUTUBE" | "DIO" | "ROCKETSEAT" | "INTERNO" | "GITHUB" | "BLOG";
export type ContentLevel = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
export type ContentStatus = "PUBLICADO" | "RASCUNHO" | "ARQUIVADO";

export type AdminContentItem = {
  id: number;
  title: string;
  platform: ContentPlatform;
  type: ContentType;
  durationMinutes: number;
  level: ContentLevel;
  rating: number;
  description: string;
  url: string | null;
  thumbnailEmoji: string | null;
  status: ContentStatus;
  createdAt: string;
  prerequisites: { id: number; label: string }[];
  syllabus: { id: number; title: string; orderIndex: number }[];
};

export type ContentInput = {
  title: string;
  platform: ContentPlatform;
  type: ContentType;
  durationMinutes: number;
  level: ContentLevel;
  status?: ContentStatus;
  description: string;
  url?: string;
  thumbnailEmoji?: string;
};

// rating is a Prisma Decimal — serializes to JSON as a string.
type RawAdminContentItem = Omit<AdminContentItem, "rating"> & { rating: number | string };
function normalize(item: RawAdminContentItem): AdminContentItem {
  return { ...item, rating: Number(item.rating) };
}

export async function getAdminContent() {
  const items = await apiRequest<RawAdminContentItem[]>(admin_content_endpoints.list);
  return items.map(normalize);
}

export async function createContent(input: ContentInput) {
  const item = await apiRequest<RawAdminContentItem>(admin_content_endpoints.list, {
    method: "POST",
    body: input,
  });
  return normalize(item);
}

export async function updateContent(id: number, input: Partial<ContentInput>) {
  const item = await apiRequest<RawAdminContentItem>(admin_content_endpoints.detail(id), {
    method: "PATCH",
    body: input,
  });
  return normalize(item);
}

export function deleteContent(id: number) {
  return apiRequest<void>(admin_content_endpoints.detail(id), { method: "DELETE" });
}
