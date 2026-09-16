import { apiRequest } from "../api";

const community_endpoints = {
  posts: "/api/community/posts",
  post: (id: number) => `/api/community/posts/${id}`,
  like: (id: number) => `/api/community/posts/${id}/like`,
  comments: (id: number) => `/api/community/posts/${id}/comments`,
  groups: "/api/community/groups",
  groupJoin: (id: number) => `/api/community/groups/${id}/join`,
};

export type PostType = "ACHIEVEMENT" | "COURSE" | "STREAK" | "GENERAL";

export type Author = {
  id: number;
  username: string;
  fullName: string;
  avatarColor: string;
};

export type Post = {
  id: number;
  type: PostType;
  content: string;
  createdAt: string;
  author: Author;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  /** Nulo = feed geral. */
  groupId: number | null;
};

/**
 * Recorte do feed, resolvido no back: sem nada, o feed geral; `groupId`, o feed do
 * grupo; `author: "me"`, só as publicações do próprio usuário (dentro e fora de grupos,
 * a menos que `groupId` restrinja).
 */
export type PostFilters = {
  groupId?: number;
  author?: "me";
};

export type Comment = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  author: Author;
};

export type Group = {
  id: number;
  name: string;
  icon: string;
  membersCount: number;
  joined: boolean;
};

export function getPosts(filters: PostFilters = {}) {
  const params = new URLSearchParams();
  if (filters.groupId !== undefined) params.set("groupId", String(filters.groupId));
  if (filters.author) params.set("author", filters.author);
  const query = params.toString();
  return apiRequest<Post[]>(query ? `${community_endpoints.posts}?${query}` : community_endpoints.posts);
}

export function createPost(content: string, options: { type?: PostType; groupId?: number } = {}) {
  return apiRequest<Post>(community_endpoints.posts, {
    method: "POST",
    body: { content, type: options.type, groupId: options.groupId },
  });
}

export function deletePost(postId: number) {
  return apiRequest<void>(community_endpoints.post(postId), { method: "DELETE" });
}

export function likePost(postId: number) {
  return apiRequest<void>(community_endpoints.like(postId), { method: "PUT" });
}

export function unlikePost(postId: number) {
  return apiRequest<void>(community_endpoints.like(postId), { method: "DELETE" });
}

export function getComments(postId: number) {
  return apiRequest<Comment[]>(community_endpoints.comments(postId));
}

export function addComment(postId: number, content: string) {
  return apiRequest<Comment>(community_endpoints.comments(postId), {
    method: "POST",
    body: { content },
  });
}

export function getGroups() {
  return apiRequest<Group[]>(community_endpoints.groups);
}

export function joinGroup(groupId: number) {
  return apiRequest<void>(community_endpoints.groupJoin(groupId), { method: "PUT" });
}

export function leaveGroup(groupId: number) {
  return apiRequest<void>(community_endpoints.groupJoin(groupId), { method: "DELETE" });
}
