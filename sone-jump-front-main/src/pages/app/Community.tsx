import { useEffect, useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Send,
  Trophy,
  Users,
  Calendar,
  Briefcase,
  Flame,
  BookOpen,
} from "lucide-react";
import {
  getPosts,
  createPost,
  likePost,
  unlikePost,
  getComments,
  addComment,
  getGroups,
  joinGroup,
  leaveGroup,
  type Post,
  type Comment,
  type Group,
} from "../../services/community/community";
import { getJobs, type Job } from "../../services/jobs/jobs";
import { getLives, type LiveSession } from "../../services/lives/lives";
import { ApiError } from "../../services/api";

const AVATAR_COLORS: Record<string, string> = {
  purple: "bg-purple-600",
  blue: "bg-blue-600",
  green: "bg-green-600",
  orange: "bg-orange-600",
  pink: "bg-pink-600",
  yellow: "bg-yellow-500",
};

function avatarClass(color: string): string {
  return AVATAR_COLORS[color] ?? "bg-purple-600";
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

const postTypeLabel: Record<Post["type"], { label: string; icon: React.ReactNode }> = {
  ACHIEVEMENT: { label: "Conquista", icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
  COURSE: { label: "Curso", icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" /> },
  STREAK: { label: "Sequência", icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
  GENERAL: { label: "", icon: null },
};

// "Top Ranking" widget removed — no user-ranking model in the backend yet,
// same documented gap as Dashboard's stat cards (see Dashboard.tsx).
export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lives, setLives] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);

  const [openComments, setOpenComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    Promise.all([getPosts(), getGroups(), getJobs(), getLives()])
      .then(([p, g, j, l]) => {
        setPosts(p);
        setGroups(g);
        setJobs(j.slice(0, 3));
        setLives(
          l
            .filter((s) => s.status === "AGENDADA")
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .slice(0, 2),
        );
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar comunidade."))
      .finally(() => setLoading(false));
  }, []);

  async function handlePublish() {
    if (!postText.trim()) return;
    setPosting(true);
    try {
      await createPost(postText.trim());
      setPostText("");
      const fresh = await getPosts();
      setPosts(fresh);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao publicar.");
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(post: Post) {
    const wasLiked = post.likedByMe;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likedByMe: !wasLiked, likesCount: p.likesCount + (wasLiked ? -1 : 1) }
          : p,
      ),
    );
    try {
      await (wasLiked ? unlikePost(post.id) : likePost(post.id));
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: wasLiked, likesCount: p.likesCount + (wasLiked ? 1 : -1) }
            : p,
        ),
      );
    }
  }

  async function toggleComments(postId: number) {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(postId);
    if (!comments[postId]) {
      try {
        const list = await getComments(postId);
        setComments((prev) => ({ ...prev, [postId]: list }));
      } catch {
        // leave panel open, empty — user can retry by closing/reopening
      }
    }
  }

  async function handleAddComment(postId: number) {
    if (!commentText.trim()) return;
    try {
      const created = await addComment(postId, commentText.trim());
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), created] }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)),
      );
      setCommentText("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao comentar.");
    }
  }

  async function toggleGroup(group: Group) {
    const wasJoined = group.joined;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === group.id
          ? { ...g, joined: !wasJoined, membersCount: g.membersCount + (wasJoined ? -1 : 1) }
          : g,
      ),
    );
    try {
      await (wasJoined ? leaveGroup(group.id) : joinGroup(group.id));
    } catch {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? { ...g, joined: wasJoined, membersCount: g.membersCount + (wasJoined ? 1 : -1) }
            : g,
        ),
      );
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando comunidade...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Comunidade</h1>
        <p className="text-zinc-400 text-sm mt-1">Compartilhe conquistas, conecte-se e cresça junto</p>
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Post Composer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Compartilhe uma conquista, aprendizado ou dúvida..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                disabled={!postText.trim() || posting}
              >
                <Send className="w-4 h-4" />
                {posting ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          {posts.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center text-sm text-zinc-500">
              Nenhuma publicação ainda. Seja o primeiro a compartilhar!
            </div>
          )}
          {posts.map((post) => (
            <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              {/* Post Header */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${avatarClass(post.author.avatarColor)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {initial(post.author.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{post.author.fullName}</span>
                    {postTypeLabel[post.type].label && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        {postTypeLabel[post.type].icon}
                        {postTypeLabel[post.type].label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">{timeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm text-zinc-200 leading-relaxed">{post.content}</p>

              {/* Reactions */}
              <div className="flex items-center gap-1 pt-1 border-t border-zinc-800">
                <button
                  onClick={() => toggleLike(post)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    post.likedByMe
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {post.likesCount}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.commentsCount}
                </button>
              </div>

              {/* Comments panel */}
              {openComments === post.id && (
                <div className="pt-2 border-t border-zinc-800 space-y-3">
                  {(comments[post.id] ?? []).map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div
                        className={`w-7 h-7 rounded-full ${avatarClass(c.author.avatarColor)} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                      >
                        {initial(c.author.fullName)}
                      </div>
                      <div className="flex-1 min-w-0 bg-zinc-800 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-white">{c.author.fullName}</p>
                        <p className="text-xs text-zinc-300 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      placeholder="Escreva um comentário..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentText.trim()}
                      className="shrink-0 text-xs bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-5">
          {/* Groups */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Grupos por Trilha</h3>
            </div>
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3">
                  <span className="text-lg">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">{g.name}</p>
                    <p className="text-xs text-zinc-500">{g.membersCount.toLocaleString("pt-BR")} membros</p>
                  </div>
                  <button
                    onClick={() => toggleGroup(g)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      g.joined
                        ? "bg-purple-600 text-white hover:bg-purple-500"
                        : "border border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    }`}
                  >
                    {g.joined ? "Participando" : "Entrar"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          {lives.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Próximas Sessões</h3>
              </div>
              <div className="space-y-3">
                {lives.map((s) => (
                  <div key={s.id} className="bg-zinc-800 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-white leading-snug">{s.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        {new Date(s.scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs Board */}
          {jobs.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Vagas Compartilhadas</h3>
              </div>
              <div className="space-y-3">
                {jobs.map((j) => (
                  <div key={j.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{j.title}</p>
                      <p className="text-xs text-zinc-500">{j.companyName}</p>
                    </div>
                    <span className="shrink-0 text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                      {j.remoteType === "REMOTO" ? "Remoto" : j.remoteType === "HIBRIDO" ? "Híbrido" : j.location}
                    </span>
                  </div>
                ))}
              </div>
              <a
                href="/app/market"
                className="block w-full mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors text-center py-1"
              >
                Ver todas as vagas →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
