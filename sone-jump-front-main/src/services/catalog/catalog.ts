import { getCurrentUser } from "../mock/mock-users-db";
import { getMockBookmarkedContent, getMockCatalog, setMockBookmark } from "../mock/mock-catalog-db";

// Endpoints reais (voltam a ser usados quando o back for plugado de novo):
// GET    /api/catalog
// GET    /api/catalog/bookmarks
// PUT    /api/catalog/:id/bookmark
// DELETE /api/catalog/:id/bookmark

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

// MOCK: sem back-end no momento — dados em services/mock/mock-catalog-db.ts.
// Catalog.tsx já faz a filtragem no cliente, mas aplicamos os filtros aqui
// também para manter a função fiel ao contrato original (que aceitava filtro
// via querystring no back real).
export async function getCatalog(filters?: { type?: ContentType; platform?: ContentPlatform }): Promise<ContentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = getCurrentUser();
  let items = getMockCatalog(user.id);
  if (filters?.type) items = items.filter((i) => i.type === filters.type);
  if (filters?.platform) items = items.filter((i) => i.platform === filters.platform);
  return items;
}

export async function getBookmarkedContent(): Promise<ContentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user = getCurrentUser();
  return getMockBookmarkedContent(user.id);
}

export async function addBookmark(contentId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const user = getCurrentUser();
  setMockBookmark(user.id, contentId, true);
}

export async function removeBookmark(contentId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const user = getCurrentUser();
  setMockBookmark(user.id, contentId, false);
}