import {
  TrendingUp,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink as Linkedin,
  Sparkles,
  ArrowUpRight,
  Briefcase,
} from "lucide-react";

const compatibleJobs = [
  {
    id: 1,
    initial: "N",
    color: "bg-purple-600",
    title: "Desenvolvedor Frontend Sênior",
    company: "Nubank",
    location: "Remoto",
    match: 95,
    salary: "R$ 12.000 – R$ 18.000",
    skills: ["React", "TypeScript", "GraphQL"],
  },
  {
    id: 2,
    initial: "I",
    color: "bg-orange-500",
    title: "Engenheiro de Software Pleno",
    company: "iFood",
    location: "Remoto",
    match: 87,
    salary: "R$ 9.000 – R$ 13.000",
    skills: ["Node.js", "React", "AWS"],
  },
  {
    id: 3,
    initial: "S",
    color: "bg-green-600",
    title: "Frontend Developer",
    company: "Stone",
    location: "Remoto",
    match: 78,
    salary: "R$ 8.000 – R$ 11.000",
    skills: ["React", "Next.js", "Tailwind"],
  },
  {
    id: 4,
    initial: "M",
    color: "bg-yellow-500",
    title: "Desenvolvedor React Junior",
    company: "Mercado Livre",
    location: "Remoto",
    match: 72,
    salary: "R$ 5.000 – R$ 8.000",
    skills: ["React", "JavaScript", "CSS"],
  },
];

const mySkills = ["React", "JavaScript", "HTML/CSS", "Git", "Node.js", "REST APIs"];
const missingSkills = ["TypeScript", "Next.js", "Testes", "GraphQL", "Docker"];

const salaryLevels = [
  { level: "Júnior", min: 3000, max: 6000, color: "bg-blue-500" },
  { level: "Pleno", min: 7000, max: 12000, color: "bg-purple-500" },
  { level: "Sênior", min: 13000, max: 22000, color: "bg-green-500" },
];

const trendingSkills = [
  { name: "TypeScript", trend: 42, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { name: "Next.js", trend: 38, color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { name: "React Native", trend: 35, color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { name: "Docker", trend: 31, color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { name: "AWS", trend: 29, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { name: "GraphQL", trend: 27, color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  { name: "Kubernetes", trend: 24, color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  { name: "Rust", trend: 22, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
];

const companies = [
  { name: "Nubank", color: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
  { name: "iFood", color: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
  { name: "Stone", color: "bg-green-500/10 text-green-300 border-green-500/20" },
  { name: "Mercado Livre", color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20" },
  { name: "PicPay", color: "bg-green-500/10 text-green-300 border-green-500/20" },
  { name: "Loft", color: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  { name: "QuintoAndar", color: "bg-teal-500/10 text-teal-300 border-teal-500/20" },
  { name: "Creditas", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
];

function matchColor(match: number) {
  if (match >= 85) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (match >= 75) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-orange-500/20 text-orange-400 border-orange-500/30";
}

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const MATCH_PERCENT = 72;

export default function Market() {
  return (
    <div className="min-h-screen bg-[#050505] p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inteligência de Mercado</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Análise em tempo real do mercado tech e compatibilidade com o seu perfil.
        </p>
      </div>

      {/* Hero: Compatibilidade com o Mercado */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex flex-col items-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={RING_RADIUS}
              fill="none"
              stroke="#27272a"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r={RING_RADIUS}
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - MATCH_PERCENT / 100)}
              transform="rotate(-90 70 70)"
            />
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <text
              x="70"
              y="65"
              textAnchor="middle"
              className="fill-white"
              style={{ fill: "white", fontSize: "22px", fontWeight: "700" }}
            >
              {MATCH_PERCENT}%
            </text>
            <text
              x="70"
              y="84"
              textAnchor="middle"
              style={{ fill: "#a1a1aa", fontSize: "10px" }}
            >
              compatível
            </text>
          </svg>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-white mb-1">Compatibilidade com o Mercado</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Seu perfil está pronto para{" "}
            <span className="text-purple-400 font-semibold">347 vagas</span> abertas agora.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="bg-zinc-800 rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-lg">347</p>
              <p className="text-zinc-400 text-xs">Vagas compatíveis</p>
            </div>
            <div className="bg-zinc-800 rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-lg">R$ 9.200</p>
              <p className="text-zinc-400 text-xs">Salário médio</p>
            </div>
            <div className="bg-zinc-800 rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-lg">+18%</p>
              <p className="text-zinc-400 text-xs">Crescimento do mercado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vagas Compatíveis */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-400" />
          Vagas Compatíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compatibleJobs.map((job) => (
            <div
              key={job.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${job.color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {job.initial}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{job.title}</p>
                    <p className="text-zinc-400 text-xs">{job.company}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-lg border ${matchColor(job.match)}`}
                >
                  {job.match}%
                </span>
              </div>

              <div className="flex items-center gap-1 text-zinc-400 text-xs">
                <MapPin className="w-3 h-3" />
                {job.location}
              </div>

              <p className="text-zinc-300 text-sm font-medium">{job.salary}</p>

              <div className="flex flex-wrap gap-1">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <button className="mt-1 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors">
                Ver Vaga
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Análise de Gap de Skills */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Análise de Gap de Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Suas Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {mySkills.map((s) => (
                <span
                  key={s}
                  className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              Skills Faltando
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((s) => (
                <span
                  key={s}
                  className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Salários por Nível */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Salários por Nível</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
          {salaryLevels.map((s) => {
            const maxVal = 22000;
            const widthMin = (s.min / maxVal) * 100;
            const widthMax = (s.max / maxVal) * 100;
            return (
              <div key={s.level}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-300 text-sm font-medium">{s.level}</span>
                  <span className="text-zinc-400 text-xs">
                    R$ {s.min.toLocaleString("pt-BR")} – R$ {s.max.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: `${widthMax}%`, minWidth: `${widthMin}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habilidades em Alta */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Habilidades em Alta
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {trendingSkills.map((skill, i) => (
            <div
              key={skill.name}
              className={`flex items-center justify-between px-5 py-3 ${
                i < trendingSkills.length - 1 ? "border-b border-zinc-800" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-xs w-4">{i + 1}</span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${skill.color}`}
                >
                  {skill.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                <ArrowUpRight className="w-3 h-3" />+{skill.trend}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empresas que Contratam */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Empresas que Contratam</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {companies.map((c) => (
            <div
              key={c.name}
              className={`border rounded-xl px-4 py-3 text-center font-semibold text-sm ${c.color} cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>

      {/* Análise LinkedIn com IA CTA */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-900/60 to-violet-900/60 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/40 flex items-center justify-center">
            <Linkedin className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Análise LinkedIn com IA</h3>
            <p className="text-purple-300 text-sm">
              Nossa IA analisa seu perfil e sugere melhorias para aumentar sua visibilidade.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
          <Sparkles className="w-4 h-4" />
          Analise seu perfil LinkedIn
        </button>
      </div>
    </div>
  );
}
