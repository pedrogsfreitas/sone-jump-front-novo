import { useState } from "react";
import { Search, Bookmark, BookmarkCheck, Star, X, Clock, BarChart2, ExternalLink } from "lucide-react";

type ContentType = "Curso" | "Vídeo" | "Artigo" | "Projeto";
type Platform = "Alura" | "Udemy" | "YouTube" | "DIO" | "Rocketseat";
type Level = "Iniciante" | "Intermediário" | "Avançado";

interface ContentItem {
  id: number;
  title: string;
  platform: Platform;
  type: ContentType;
  duration: string;
  level: Level;
  rating: number;
  description: string;
  prerequisites: string[];
  syllabus: string[];
  gradient: string;
  badgeColor: string;
  emoji: string;
}

const CONTENT: ContentItem[] = [
  {
    id: 1,
    title: "React do Zero ao Avançado com Hooks e Context",
    platform: "Udemy",
    type: "Curso",
    duration: "42h",
    level: "Intermediário",
    rating: 4.8,
    description:
      "Aprenda React de forma completa, desde os conceitos básicos até padrões avançados como Context API, Redux Toolkit e React Query.",
    prerequisites: ["JavaScript ES6+", "HTML/CSS básico"],
    syllabus: [
      "Introdução ao React e JSX",
      "Componentes funcionais e props",
      "useState e useEffect",
      "useContext e useReducer",
      "React Router v6",
      "Formulários com React Hook Form",
      "Projeto final: dashboard completo",
    ],
    gradient: "from-blue-900/80 to-cyan-900/40",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    emoji: "⚛️",
  },
  {
    id: 2,
    title: "JavaScript Moderno: ES6+ para Iniciantes",
    platform: "Rocketseat",
    type: "Curso",
    duration: "18h",
    level: "Iniciante",
    rating: 4.7,
    description:
      "Domine o JavaScript moderno com Arrow Functions, Destructuring, Spread, Promises, Async/Await e muito mais.",
    prerequisites: ["Lógica de programação básica"],
    syllabus: [
      "Variáveis let e const",
      "Arrow Functions",
      "Template Literals",
      "Destructuring e Spread",
      "Promises e Async/Await",
      "Módulos ES6",
      "Projeto prático",
    ],
    gradient: "from-purple-900/80 to-pink-900/40",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    emoji: "🚀",
  },
  {
    id: 3,
    title: "TypeScript: Tipagem Estática no Frontend",
    platform: "Alura",
    type: "Curso",
    duration: "12h",
    level: "Intermediário",
    rating: 4.6,
    description:
      "Adicione tipagem estática ao seu JavaScript. Interfaces, Generics, Utility Types e integração com React.",
    prerequisites: ["JavaScript ES6+", "Noções de React"],
    syllabus: [
      "Por que TypeScript?",
      "Tipos básicos e interfaces",
      "Generics e Utility Types",
      "TypeScript com React",
      "Configuração do tsconfig",
      "Projeto prático",
    ],
    gradient: "from-blue-900/60 to-indigo-900/40",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    emoji: "🔷",
  },
  {
    id: 4,
    title: "Git e GitHub: Controle de Versão na Prática",
    platform: "DIO",
    type: "Curso",
    duration: "8h",
    level: "Iniciante",
    rating: 4.5,
    description:
      "Aprenda versionamento de código com Git, colabore via GitHub e domine o fluxo de trabalho com branches e pull requests.",
    prerequisites: ["Nenhum"],
    syllabus: [
      "Instalação e configuração",
      "Commits e branches",
      "Merge e rebase",
      "GitHub e repositórios remotos",
      "Pull Requests e Code Review",
      "Git Flow",
    ],
    gradient: "from-orange-900/60 to-red-900/40",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    emoji: "🌿",
  },
  {
    id: 5,
    title: "CSS Grid e Flexbox: Layouts Modernos",
    platform: "YouTube",
    type: "Vídeo",
    duration: "3h",
    level: "Iniciante",
    rating: 4.9,
    description:
      "Crie layouts responsivos e complexos com CSS Grid e Flexbox. Tutoriais práticos com projetos reais.",
    prerequisites: ["HTML e CSS básico"],
    syllabus: [
      "Flexbox completo",
      "CSS Grid básico",
      "Grid Template Areas",
      "Layouts responsivos",
      "Projeto: Clone de layout",
    ],
    gradient: "from-red-900/60 to-pink-900/40",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    emoji: "🎨",
  },
  {
    id: 6,
    title: "Next.js 14: App Router e Server Components",
    platform: "Rocketseat",
    type: "Curso",
    duration: "28h",
    level: "Avançado",
    rating: 4.7,
    description:
      "Explore o novo paradigma do Next.js com App Router, Server Components, Streaming e Server Actions.",
    prerequisites: ["React intermediário", "TypeScript básico"],
    syllabus: [
      "App Router vs Pages Router",
      "Server e Client Components",
      "Data Fetching com fetch",
      "Server Actions",
      "Streaming e Suspense",
      "Deploy na Vercel",
    ],
    gradient: "from-purple-900/80 to-violet-900/40",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    emoji: "▲",
  },
  {
    id: 7,
    title: "Node.js: Construindo APIs REST com Fastify",
    platform: "Alura",
    type: "Curso",
    duration: "20h",
    level: "Intermediário",
    rating: 4.4,
    description:
      "Crie APIs profissionais com Node.js e Fastify. Autenticação JWT, Prisma ORM e deploy em produção.",
    prerequisites: ["JavaScript ES6+", "Noções de banco de dados"],
    syllabus: [
      "Introdução ao Node.js",
      "Fastify setup e rotas",
      "Banco de dados com Prisma",
      "Autenticação com JWT",
      "Testes com Vitest",
      "Deploy na Railway",
    ],
    gradient: "from-green-900/60 to-emerald-900/40",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    emoji: "🟢",
  },
  {
    id: 8,
    title: "Como Construir um Portfólio que Impressiona Recrutadores",
    platform: "YouTube",
    type: "Artigo",
    duration: "15 min",
    level: "Iniciante",
    rating: 4.6,
    description:
      "Dicas práticas para montar um portfólio de dev que chama atenção no mercado de trabalho brasileiro.",
    prerequisites: ["Nenhum"],
    syllabus: [
      "Quais projetos incluir",
      "Como escrever READMEs",
      "GitHub profile README",
      "Deploy dos projetos",
      "Depoimentos e contribuições",
    ],
    gradient: "from-yellow-900/60 to-orange-900/40",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    emoji: "💼",
  },
  {
    id: 9,
    title: "Desafio: Clone do Spotify com React e Tailwind",
    platform: "DIO",
    type: "Projeto",
    duration: "6h",
    level: "Intermediário",
    rating: 4.8,
    description:
      "Projeto prático completo: recrie a interface do Spotify usando React, Tailwind CSS e a API do Spotify.",
    prerequisites: ["React básico", "Tailwind CSS"],
    syllabus: [
      "Setup do projeto",
      "Layout com Tailwind",
      "Integração com Spotify API",
      "Player de música",
      "Responsividade",
      "Deploy",
    ],
    gradient: "from-green-900/80 to-teal-900/40",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    emoji: "🎵",
  },
];

const FEATURED = [CONTENT[0], CONTENT[1]];

const TYPE_FILTERS = ["Todos", "Cursos", "Vídeos", "Artigos", "Projetos"] as const;
const PLATFORM_FILTERS: Platform[] = ["Alura", "Udemy", "YouTube", "DIO", "Rocketseat"];

const PLATFORM_COLORS: Record<Platform, string> = {
  Alura: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Udemy: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  YouTube: "bg-red-500/20 text-red-300 border-red-500/30",
  DIO: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Rocketseat: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const LEVEL_COLORS: Record<Level, string> = {
  Iniciante: "bg-green-500/20 text-green-300 border-green-500/30",
  Intermediário: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Avançado: "bg-red-500/20 text-red-300 border-red-500/30",
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
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<(typeof TYPE_FILTERS)[number]>("Todos");
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([]);
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [modal, setModal] = useState<ContentItem | null>(null);

  const togglePlatform = (p: Platform) =>
    setActivePlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const toggleBookmark = (id: number) =>
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const typeMap: Record<string, ContentType | null> = {
    Todos: null,
    Cursos: "Curso",
    Vídeos: "Vídeo",
    Artigos: "Artigo",
    Projetos: "Projeto",
  };

  const filtered = CONTENT.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.platform.toLowerCase().includes(search.toLowerCase());
    const matchType =
      activeType === "Todos" || c.type === typeMap[activeType];
    const matchPlatform =
      activePlatforms.length === 0 || activePlatforms.includes(c.platform);
    return matchSearch && matchType && matchPlatform;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          placeholder="Buscar cursos, vídeos, artigos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

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
            {p}
          </button>
        ))}
      </div>

      {/* Featured section */}
      {search === "" && activeType === "Todos" && activePlatforms.length === 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">Recomendados para você</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURED.map((item) => (
              <div
                key={item.id}
                className={`relative bg-gradient-to-br ${item.gradient} border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-purple-500/50 transition-all group`}
                onClick={() => setModal(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{item.emoji}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[item.platform]}`}
                  >
                    {item.platform}
                  </span>
                </div>
                <h3 className="font-bold text-white leading-tight mb-2 group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-zinc-400 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {item.duration}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-xs ${LEVEL_COLORS[item.level]}`}
                  >
                    {item.level}
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
        {search || activeType !== "Todos" || activePlatforms.length > 0
          ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`
          : "Todos os Conteúdos"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group flex flex-col"
          >
            {/* Thumbnail */}
            <div
              className={`h-28 bg-gradient-to-br ${item.gradient} flex items-center justify-center cursor-pointer`}
              onClick={() => setModal(item)}
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">
                {item.emoji}
              </span>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[item.platform]}`}
                >
                  {item.platform}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
                  {item.type}
                </span>
              </div>

              <h3
                className="text-sm font-semibold text-white leading-tight mb-2 cursor-pointer hover:text-purple-300 transition-colors line-clamp-2"
                onClick={() => setModal(item)}
              >
                {item.title}
              </h3>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[item.level]}`}
                >
                  {item.level}
                </span>
                <span className="flex items-center gap-1 text-zinc-500 text-xs">
                  <Clock size={10} />
                  {item.duration}
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
                  onClick={() => toggleBookmark(item.id)}
                >
                  {bookmarked.includes(item.id) ? (
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
            {/* Modal header thumbnail */}
            <div
              className={`h-36 bg-gradient-to-br ${modal.gradient} relative flex items-center justify-center`}
            >
              <span className="text-6xl">{modal.emoji}</span>
              <button
                className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg transition-colors"
                onClick={() => setModal(null)}
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex gap-2 mb-3 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[modal.platform]}`}
                >
                  {modal.platform}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
                  {modal.type}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[modal.level]}`}
                >
                  {modal.level}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-3">{modal.title}</h2>

              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {modal.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="fill-yellow-400 text-yellow-400" />
                  {modal.rating.toFixed(1)}
                </span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                {modal.description}
              </p>

              <div className="mb-4">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-2">
                  Pré-requisitos
                </h3>
                <ul className="space-y-1">
                  {modal.prerequisites.map((req) => (
                    <li
                      key={req}
                      className="text-xs text-zinc-400 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-purple-500 rounded-full shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-5">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-2">
                  Conteúdo
                </h3>
                <ul className="space-y-1">
                  {modal.syllabus.map((item, i) => (
                    <li
                      key={item}
                      className="text-xs text-zinc-400 flex items-start gap-2"
                    >
                      <span className="text-purple-500 font-mono shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <ExternalLink size={16} />
                Acessar Conteúdo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
