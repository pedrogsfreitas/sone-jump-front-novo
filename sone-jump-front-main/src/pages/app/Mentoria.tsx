import { useState } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Video,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  User,
  BookOpen,
} from "lucide-react";

type Tab = "encontrar" | "minhas" | "primeiro";

const mentors = [
  {
    id: 1,
    initial: "A",
    color: "bg-purple-600",
    name: "Ana Souza",
    role: "Senior Frontend Engineer",
    company: "Nubank",
    specialties: ["React", "TypeScript", "Performance"],
    rating: 4.9,
    sessions: 128,
    price: "Grátis",
    priceStyle: "text-green-400",
  },
  {
    id: 2,
    initial: "R",
    color: "bg-blue-600",
    name: "Rafael Mendes",
    role: "Tech Lead",
    company: "iFood",
    specialties: ["Node.js", "Arquitetura", "AWS"],
    rating: 4.8,
    sessions: 94,
    price: "R$ 80/hora",
    priceStyle: "text-purple-400",
  },
  {
    id: 3,
    initial: "C",
    color: "bg-orange-500",
    name: "Camila Torres",
    role: "Fullstack Developer",
    company: "Stone",
    specialties: ["Next.js", "GraphQL", "Testes"],
    rating: 5.0,
    sessions: 57,
    price: "R$ 60/hora",
    priceStyle: "text-purple-400",
  },
  {
    id: 4,
    initial: "G",
    color: "bg-green-600",
    name: "Gabriel Lima",
    role: "Mobile Engineer",
    company: "PicPay",
    specialties: ["React Native", "Expo", "CI/CD"],
    rating: 4.7,
    sessions: 73,
    price: "Grátis",
    priceStyle: "text-green-400",
  },
];

const sessionHistory = [
  {
    mentor: "Ana Souza",
    topic: "Hooks avançados no React",
    date: "12/06/2025",
    status: "Concluída",
  },
  {
    mentor: "Rafael Mendes",
    topic: "Arquitetura de microsserviços",
    date: "05/06/2025",
    status: "Concluída",
  },
  {
    mentor: "Camila Torres",
    topic: "Estratégias de testes unitários",
    date: "28/05/2025",
    status: "Concluída",
  },
];

const cvChecklist = [
  { label: "Foto profissional", done: true },
  { label: "Resumo objetivo", done: true },
  { label: "Stack listada", done: false },
  { label: "Projetos com links", done: false },
];

const interviewTips = [
  {
    title: "Pesquise a empresa antes",
    body: "Entenda o produto, missão e stack tecnológica da empresa. Demonstrar conhecimento sobre o negócio mostra iniciativa e interesse real.",
  },
  {
    title: "Explique seu raciocínio em voz alta",
    body: "Durante desafios técnicos, verbalize seu processo de pensamento. Os entrevistadores avaliam como você aborda problemas, não apenas a resposta final.",
  },
  {
    title: "Prepare perguntas para fazer",
    body: "Ao final da entrevista pergunte sobre o dia a dia do time, stack atual e desafios. Isso demonstra maturidade profissional.",
  },
  {
    title: "Pratique com projetos reais",
    body: "Ter projetos no GitHub com README claro e deploy funcionando faz diferença. Prove que você constrói coisas, não apenas estuda.",
  },
];

const areas = ["Todos", "Frontend", "Backend", "Mobile", "DevOps", "Data"];
const levels = ["Todos", "Júnior", "Pleno", "Sênior"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"
          }`}
        />
      ))}
      <span className="text-zinc-300 text-xs ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function TipAccordion({ tip }: { tip: (typeof interviewTips)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-zinc-900 hover:bg-zinc-800 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-zinc-200 text-sm font-medium">{tip.title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="bg-zinc-900/50 px-4 py-3 border-t border-zinc-800">
          <p className="text-zinc-400 text-sm leading-relaxed">{tip.body}</p>
        </div>
      )}
    </div>
  );
}

export default function Mentoria() {
  const [tab, setTab] = useState<Tab>("encontrar");
  const [area, setArea] = useState("Todos");
  const [level, setLevel] = useState("Todos");

  return (
    <div className="min-h-screen bg-[#050505] p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mentoria</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Acelere sua carreira com mentores experientes do mercado tech.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit gap-1">
        {(
          [
            { id: "encontrar", label: "Encontrar Mentor" },
            { id: "minhas", label: "Minhas Mentorias" },
            { id: "primeiro", label: "Primeiro Emprego" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-purple-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Encontrar Mentor ── */}
      {tab === "encontrar" && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-xs">Área</label>
              <div className="flex gap-1 flex-wrap">
                {areas.map((a) => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      area === a
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-xs">Nível</label>
              <div className="flex gap-1">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      level === l
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mentor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => (
              <div
                key={m.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {m.initial}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{m.name}</p>
                    <p className="text-zinc-400 text-xs">{m.role}</p>
                    <p className="text-zinc-500 text-xs">{m.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {m.specialties.map((s) => (
                    <span
                      key={s}
                      className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <StarRating rating={m.rating} />
                  <span className="text-zinc-500 text-xs">{m.sessions} mentorias realizadas</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm ${m.priceStyle}`}>{m.price}</span>
                  <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                    Solicitar Mentoria
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Minhas Mentorias ── */}
      {tab === "minhas" && (
        <div className="space-y-6">
          {/* Active Session */}
          <div className="bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <div>
                <p className="text-white font-semibold">Ana Souza</p>
                <p className="text-zinc-400 text-sm">Senior Frontend Engineer · Nubank</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    25/06/2025
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    19:00 – 20:00
                  </span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors">
              <Video className="w-4 h-4" />
              Entrar na Reunião
            </button>
          </div>

          {/* Session History */}
          <div>
            <h3 className="text-white font-semibold mb-3">Histórico de Sessões</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-zinc-400 font-medium px-4 py-3 text-left">Mentor</th>
                    <th className="text-zinc-400 font-medium px-4 py-3 text-left">Tema</th>
                    <th className="text-zinc-400 font-medium px-4 py-3 text-left">Data</th>
                    <th className="text-zinc-400 font-medium px-4 py-3 text-left">Status</th>
                    <th className="text-zinc-400 font-medium px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map((s, i) => (
                    <tr
                      key={i}
                      className={i < sessionHistory.length - 1 ? "border-b border-zinc-800" : ""}
                    >
                      <td className="px-4 py-3 text-zinc-200">{s.mentor}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.topic}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.date}</td>
                      <td className="px-4 py-3">
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2 py-0.5 rounded-full">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-purple-400 hover:text-purple-300 text-xs transition-colors">
                          Ver Notas
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Primeiro Emprego ── */}
      {tab === "primeiro" && (
        <div className="space-y-5">
          {/* CV Review */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Revisão de Currículo</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Verifique os pontos essenciais do seu CV antes de enviar para vagas.
            </p>
            <div className="space-y-2">
              {cvChecklist.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${item.done ? "text-zinc-300" : "text-zinc-500 line-through"}`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors">
              Analisar CV com IA
            </button>
          </div>

          {/* Interview Simulation */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Simulação de Entrevista</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Pratique com perguntas reais de entrevistas técnicas e receba feedback da IA.
            </p>
            <div>
              <label className="text-zinc-400 text-xs mb-2 block">Nível de dificuldade</label>
              <div className="flex gap-2">
                {["Iniciante", "Intermediário", "Avançado"].map((d) => (
                  <button
                    key={d}
                    className="flex-1 py-2 border border-zinc-700 rounded-xl text-zinc-400 text-xs hover:border-purple-500 hover:text-purple-300 transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold transition-all">
              Simular Entrevista Técnica
            </button>
          </div>

          {/* Interview Tips Accordion */}
          <div>
            <h3 className="text-white font-semibold mb-3">Dicas para Entrevistas</h3>
            <div className="space-y-2">
              {interviewTips.map((tip) => (
                <TipAccordion key={tip.title} tip={tip} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
