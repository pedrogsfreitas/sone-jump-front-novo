import { apiRequest } from "../api";

const catalog_endpoints = {
  list: "/api/catalog",
  bookmarks: "/api/catalog/bookmarks",
  bookmark: (id: number) => `/api/catalog/${id}/bookmark`,
};

export type ContentType = "CURSO" | "VIDEO" | "ARTIGO" | "PROJETO";
export type ContentPlatform =
  | "ALURA"
  | "UDEMY"
  | "YOUTUBE"
  | "DIO"
  | "ROCKETSEAT"
  | "INTERNO"
  | "GITHUB"
  | "BLOG";
export type ContentLevel = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";

export type ContentItem = {
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
  prerequisites: string[];
  syllabus: string[];
  bookmarked: boolean;
};

// Prisma's Decimal fields (rating) serialize to JSON as strings, not numbers —
// normalize once here so every caller can treat `rating` as a real number.
type RawContentItem = Omit<ContentItem, "rating"> & { rating: number | string };
function normalize(item: RawContentItem): ContentItem {
  return { ...item, rating: Number(item.rating) };
}

export async function getCatalog(filters?: { type?: ContentType; platform?: ContentPlatform }) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.platform) params.set("platform", filters.platform);
  const query = params.toString();
  const items = await apiRequest<RawContentItem[]>(`${catalog_endpoints.list}${query ? `?${query}` : ""}`);
  return items.map(normalize);
}

export async function getBookmarkedContent() {
  const items = await apiRequest<RawContentItem[]>(catalog_endpoints.bookmarks);
  return items.map(normalize);
}

export function addBookmark(contentId: number) {
  return apiRequest<void>(catalog_endpoints.bookmark(contentId), { method: "PUT" });
}

export function removeBookmark(contentId: number) {
  return apiRequest<void>(catalog_endpoints.bookmark(contentId), { method: "DELETE" });
}
