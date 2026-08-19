import { useEffect, useState } from "react";
import { Search, Bookmark, BookmarkCheck, Star, X, Clock, BarChart2 } from "lucide-react";
import {
  getCatalog,
  addBookmark,
  removeBookmark,
  type ContentItem,
  type ContentPlatform,
  type ContentType,
} from "../../services/catalog/catalog";
import { ApiError } from "../../services/api";
import { formatDuration } from "../../utils/format";

const TYPE_FILTERS = ["Todos", "Cursos", "Vídeos", "Artigos", "Projetos"] as const;
const TYPE_MAP: Record<string, ContentType | null> = {
  Todos: null,
  Cursos: "CURSO",
  Vídeos: "VIDEO",
  Artigos: "ARTIGO",
  Projetos: "PROJETO",
};
const TYPE_LABELS: Record<ContentType, string> = {
  CURSO: "Curso",
  VIDEO: "Vídeo",
  ARTIGO: "Artigo",
  PROJETO: "Projeto",
};

const PLATFORM_FILTERS: ContentPlatform[] = ["ALURA", "UDEMY", "YOUTUBE", "DIO", "ROCKETSEAT"];
const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  ALURA: "Alura",
  UDEMY: "Udemy",
  YOUTUBE: "YouTube",
  DIO: "DIO",
  ROCKETSEAT: "Rocketseat",
  INTERNO: "Interno",
  GITHUB: "GitHub",
  BLOG: "Blog",
};
const PLATFORM_COLORS: Record<ContentPlatform, string> = {
  ALURA: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  UDEMY: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  YOUTUBE: "bg-red-500/20 text-red-300 border-red-500/30",
  DIO: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  ROCKETSEAT: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  INTERNO: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  GITHUB: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  BLOG: "bg-teal-500/20 text-teal-300 border-teal-500/30",
};
const LEVEL_LABELS: Record<ContentItem["level"], string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};
const LEVEL_COLORS: Record<ContentItem["level"], string> = {
  INICIANTE: "bg-green-500/20 text-green-300 border-green-500/30",
  INTERMEDIARIO: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  AVANCADO: "bg-red-500/20 text-red-300 border-red-500/30",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={12} className="fill-yellow-400 text-yellow-400" />
      <span className="text-xs text-zinc-300">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Catalog() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<(typeof TYPE_FILTERS)[number]>("Todos");
  const [activePlatforms, setActivePlatforms] = useState<ContentPlatform[]>([]);
  const [modal, setModal] = useState<ContentItem | null>(null);
  const [bookmarkError, setBookmarkError] = useState("");

  useEffect(() => {
    getCatalog()
      .then(setItems)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar catálogo."))
      .finally(() => setLoading(false));
  }, []);

  const togglePlatform = (p: ContentPlatform) =>
    setActivePlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  async function toggleBookmark(item: ContentItem) {
    setBookmarkError("");
    try {
      if (item.bookmarked) {
        await removeBookmark(item.id);
      } else {
        await addBookmark(item.id);
      }
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, bookmarked: !i.bookmarked } : i)));
      setModal((prev) => (prev && prev.id === item.id ? { ...prev, bookmarked: !prev.bookmarked } : prev));
    } catch (e) {
      setBookmarkError(e instanceof ApiError ? e.message : "Erro ao salvar bookmark.");
    }
  }

  const filtered = items.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      PLATFORM_LABELS[c.platform].toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "Todos" || c.type === TYPE_MAP[activeType];
    const matchPlatform = activePlatforms.length === 0 || activePlatforms.includes(c.platform);
    return matchSearch && matchType && matchPlatform;
  });

  const featured = items.slice(0, 2);
  const noFiltersActive = search === "" && activeType === "Todos" && activePlatforms.length === 0;

  if (loading) {
    return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando catálogo...</div>;
  }
  if (error) {
    return <div className="min-h-screen bg-[#050505] text-red-400 p-6">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar cursos, vídeos, artigos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {bookmarkError && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {bookmarkError}
        </div>
      )}

      {/* Type filter pills */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveType(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeType === f
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Platform filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {PLATFORM_FILTERS.map((p) => (
          <button
            key={p}
            onClick={() => togglePlatform(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              activePlatforms.includes(p)
                ? PLATFORM_COLORS[p]
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600"
            }`}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Featured section */}
      {noFiltersActive && featured.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">Recomendados para você</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((item) => (
              <div
                key={item.id}
                className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-purple-500/50 transition-all group"
                onClick={() => setModal(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{item.thumbnailEmoji ?? "📘"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[item.platform]}`}>
                    {PLATFORM_LABELS[item.platform]}
                  </span>
                </div>
                <h3 className="font-bold text-white leading-tight mb-2 group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-zinc-400 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatDuration(item.durationMinutes)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${LEVEL_COLORS[item.level]}`}>
                    {LEVEL_LABELS[item.level]}
                  </span>
                  <Stars rating={item.rating} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <h2 className="text-lg font-bold mb-3">
        {!noFiltersActive ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}` : "Todos os Conteúdos"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group flex flex-col"
          >
            <div
              className="h-28 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center cursor-pointer"
              onClick={() => setModal(item)}
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">
                {item.thumbnailEmoji ?? "📘"}
              </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[item.platform]}`}>
                  {PLATFORM_LABELS[item.platform]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
                  {TYPE_LABELS[item.type]}
                </span>
              </div>

              <h3
                className="text-sm font-semibold text-white leading-tight mb-2 cursor-pointer hover:text-purple-300 transition-colors line-clamp-2"
                onClick={() => setModal(item)}
              >
                {item.title}
              </h3>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[item.level]}`}>
                  {LEVEL_LABELS[item.level]}
                </span>
                <span className="flex items-center gap-1 text-zinc-500 text-xs">
                  <Clock size={10} />
                  {formatDuration(item.durationMinutes)}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart2 size={10} className="text-zinc-500" />
                  <Stars rating={item.rating} />
                </span>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <button
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium py-2 rounded-xl transition-colors"
                  onClick={() => setModal(item)}
                >
                  Ver Conteúdo
                </button>
                <button
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                  onClick={() => toggleBookmark(item)}
                >
                  {item.bookmarked ? (
                    <BookmarkCheck size={15} className="text-purple-400" />
                  ) : (
                    <Bookmark size={15} className="text-zinc-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum conteúdo encontrado</p>
          <p className="text-sm mt-1">Tente outros filtros ou termos de busca</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-36 bg-gradient-to-br from-zinc-800 to-zinc-900 relative flex items-center justify-center">
              <span className="text-6xl">{modal.thumbnailEmoji ?? "📘"}</span>
              <button
                className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg transition-colors"
                onClick={() => setModal(null)}
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[modal.platform]}`}>
                  {PLATFORM_LABELS[modal.platform]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
                  {TYPE_LABELS[modal.type]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[modal.level]}`}>
                  {LEVEL_LABELS[modal.level]}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-3">{modal.title}</h2>

              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {formatDuration(modal.durationMinutes)}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="fill-yellow-400 text-yellow-400" />
                  {modal.rating.toFixed(1)}
                </span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-4">{modal.description}</p>

              {modal.prerequisites.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-2">
                    Pré-requisitos
                  </h3>
                  <ul className="space-y-1">
                    {modal.prerequisites.map((req) => (
                      <li key={req} className="text-xs text-zinc-400 flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {modal.syllabus.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-2">Conteúdo</h3>
                  <ul className="space-y-1">
                    {modal.syllabus.map((item, i) => (
                      <li key={item} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="text-purple-500 font-mono shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {modal.url && (
                <a
                  href={modal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Acessar Conteúdo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
