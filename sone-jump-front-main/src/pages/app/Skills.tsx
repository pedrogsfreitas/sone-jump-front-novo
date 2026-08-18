import { useState } from "react";
import {
  Lock,
  CheckCircle,
  GitBranch as Github,
  ExternalLink,
  Plus,
  Award,
  CheckCheck,
  Clock,
  Zap,
  Tag,
} from "lucide-react";

type Tab = "desafios" | "projetos" | "certificacoes" | "portfolio";
type Filter = "todos" | "iniciante" | "intermediario" | "avancado";

const challenges = [
  {
    title: "Criar landing page responsiva",
    difficulty: "iniciante" as Filter,
    xp: 80,
    tags: ["HTML", "CSS"],
    time: "2h",
    description: "Monte uma landing page moderna e responsiva com HTML semântico e CSS.",
  },
  {
    title: "Calculadora com JavaScript puro",
    difficulty: "iniciante" as Filter,
    xp: 100,
    tags: ["JavaScript", "DOM"],
    time: "3h",
    description: "Implemente uma calculadora funcional manipulando o DOM com JS.",
  },
  {
    title: "Dashboard com React",
    difficulty: "intermediario" as Filter,
    xp: 180,
    tags: ["React", "Tailwind"],
    time: "5h",
    description: "Crie um painel de controle com gráficos e componentes reutilizáveis.",
  },
  {
    title: "API REST com Node.js",
    difficulty: "intermediario" as Filter,
    xp: 200,
    tags: ["Node.js", "Express", "REST"],
    time: "6h",
    description: "Construa uma API completa com autenticação JWT e CRUD.",
  },
  {
    title: "Clone do Twitter com Next.js",
    difficulty: "avancado" as Filter,
    xp: 350,
    tags: ["Next.js", "TypeScript", "Prisma"],
    time: "12h",
    description: "Desenvolva um clone funcional com autenticação e feed em tempo real.",
  },
  {
    title: "Algoritmos de ordenação",
    difficulty: "avancado" as Filter,
    xp: 280,
    tags: ["JavaScript", "Algoritmos"],
    time: "8h",
    description: "Implemente e visualize bubble sort, merge sort e quick sort.",
  },
];

const projects = [
  { title: "Portfolio Pessoal", stack: ["React", "Tailwind"], gradient: "from-purple-600 to-blue-600", github: "#", demo: "#" },
  { title: "App de Tarefas", stack: ["Vue.js", "Firebase"], gradient: "from-green-600 to-teal-600", github: "#", demo: "#" },
  { title: "E-commerce Simples", stack: ["Next.js", "Stripe"], gradient: "from-orange-600 to-red-600", github: "#", demo: "#" },
  { title: "Chat em Tempo Real", stack: ["React", "Socket.io"], gradient: "from-pink-600 to-purple-600", github: "#", demo: "#" },
];

const certifications = [
  { name: "HTML & CSS Fundamentals", date: "Mar 2026", earned: true },
  { name: "JavaScript Essencial", date: "Abr 2026", earned: true },
  { name: "React Básico ao Avançado", date: null, earned: false },
  { name: "TypeScript na Prática", date: null, earned: false },
  { name: "Node.js & APIs REST", date: null, earned: false },
];

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  iniciante: { label: "Iniciante", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  intermediario: { label: "Intermediário", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  avancado: { label: "Avançado", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

const marketConditions = [
  "Completar 3 certificações",
  "Finalizar 5 desafios práticos",
  "Ter score ≥ 80",
  "Adicionar 2 projetos ao portfolio",
];

export default function Skills() {
  const [activeTab, setActiveTab] = useState<Tab>("desafios");
  const [filter, setFilter] = useState<Filter>("todos");

  const filteredChallenges =
    filter === "todos" ? challenges : challenges.filter((c) => c.difficulty === filter);

  // SVG circle progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const score = 68;
  const offset = circumference - (score / 100) * circumference;

  const tabs: { id: Tab; label: string }[] = [
    { id: "desafios", label: "Desafios" },
    { id: "projetos", label: "Projetos" },
    { id: "certificacoes", label: "Certificações" },
    { id: "portfolio", label: "Portfolio" },
  ];

  const filters: { id: Filter; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "iniciante", label: "Iniciante" },
    { id: "intermediario", label: "Intermediário" },
    { id: "avancado", label: "Avançado" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Validação de Habilidades</h1>
        <p className="text-zinc-400 text-sm mt-1">Prove suas skills e conquiste oportunidades reais</p>
      </div>

      {/* Employability Score Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative flex items-center justify-center w-48 h-48 shrink-0">
          <svg width="192" height="192" viewBox="0 0 192 192">
            <circle
              cx="96"
              cy="96"
              r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth="14"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              fill="none"
              stroke="#a855f7"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 96 96)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white">{score}</span>
            <span className="text-xs text-zinc-400">de 100</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Score de Empregabilidade</h2>
          <p className="text-zinc-400 mb-4">Continue evoluindo para alcançar 80+</p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-zinc-800 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-zinc-500">Categoria</p>
              <p className="text-sm font-semibold text-yellow-400">Emergente</p>
            </div>
            <div className="bg-zinc-800 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-zinc-500">Próximo nível</p>
              <p className="text-sm font-semibold text-green-400">+12 pts</p>
            </div>
            <div className="bg-zinc-800 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-zinc-500">Ranking</p>
              <p className="text-sm font-semibold text-purple-400">#234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* DESAFIOS TAB */}
          {activeTab === "desafios" && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      filter === f.id
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((ch) => {
                  const dc = difficultyConfig[ch.difficulty];
                  return (
                    <div
                      key={ch.title}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-3 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white leading-tight">{ch.title}</h3>
                        <span className={`shrink-0 text-xs border px-2 py-0.5 rounded-full ${dc.color} ${dc.bg}`}>
                          {dc.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{ch.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ch.tags.map((t) => (
                          <span key={t} className="flex items-center gap-1 text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                            <Tag className="w-2.5 h-2.5" />{t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ch.time}</span>
                        <span className="flex items-center gap-1 text-yellow-400 font-medium"><Zap className="w-3.5 h-3.5" />+{ch.xp} XP</span>
                      </div>
                      <button className="mt-auto w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                        Iniciar Desafio
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROJETOS TAB */}
          {activeTab === "projetos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div key={p.title} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors">
                  <div className={`h-28 bg-gradient-to-br ${p.gradient} opacity-80`} />
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {p.stack.map((t) => (
                        <span key={t} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a href={p.github} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                        <Github className="w-3.5 h-3.5" />GitHub
                      </a>
                      <a href={p.demo} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />Demo
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CERTIFICAÇÕES TAB */}
          {activeTab === "certificacoes" && (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    cert.earned
                      ? "bg-zinc-800 border-zinc-700"
                      : "bg-zinc-800/50 border-zinc-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cert.earned ? (
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-500 shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${cert.earned ? "text-white" : "text-zinc-500"}`}>
                        {cert.name}
                      </p>
                      {cert.earned && cert.date && (
                        <p className="text-xs text-zinc-500">Conquistado em {cert.date}</p>
                      )}
                    </div>
                  </div>
                  {cert.earned ? (
                    <span className="text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-3 py-1 rounded-full">
                      Conquistado
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500 border border-zinc-700 px-3 py-1 rounded-full">
                      Completar para desbloquear
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PORTFOLIO TAB */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Seus projetos públicos no portfolio</p>
                <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Adicionar Projeto
                </button>
              </div>
              {projects.slice(0, 2).map((p) => (
                <div key={p.title} className="flex items-center gap-4 bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${p.gradient} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.stack.map((t) => (
                        <span key={t} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={p.github} className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors">
                      <Github className="w-4 h-4 text-zinc-300" />
                    </a>
                    <a href={p.demo} className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors">
                      <ExternalLink className="w-4 h-4 text-zinc-300" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market Ready Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-purple-900/60 border border-purple-500/30 rounded-xl p-6">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl shrink-0">
            <Award className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Selo Pronto para o Mercado</h3>
            <p className="text-sm text-zinc-400 mb-4">Complete os requisitos abaixo para desbloquear seu selo oficial</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {marketConditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCheck className={`w-4 h-4 shrink-0 ${i < 2 ? "text-green-400" : "text-zinc-600"}`} />
                  <span className={i < 2 ? "text-zinc-300" : "text-zinc-500"}>{cond}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Ver Progresso
          </button>
        </div>
      </div>
    </div>
  );
}
