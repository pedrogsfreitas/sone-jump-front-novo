import { useState } from "react";
import {
  Radio,
  Users,
  Calendar,
  Play,
  Eye,
  Clock,
  ThumbsUp,
  Send,
  Code2,
  Upload,
  ChevronRight,
} from "lucide-react";

const upcomingLives = [
  {
    id: 1,
    date: "25 Jun",
    weekday: "Qua",
    time: "19:00",
    title: "TypeScript do Zero ao Avançado",
    speaker: "Ana Souza",
    topics: ["Types", "Generics", "Decorators"],
    attendees: 412,
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/20",
  },
  {
    id: 2,
    date: "27 Jun",
    weekday: "Sex",
    time: "20:00",
    title: "Next.js 15: App Router na Prática",
    speaker: "Rafael Mendes",
    topics: ["App Router", "Server Actions", "RSC"],
    attendees: 389,
    gradient: "from-slate-600/20 to-zinc-600/20",
    border: "border-slate-500/20",
  },
  {
    id: 3,
    date: "30 Jun",
    weekday: "Seg",
    time: "19:00",
    title: "Node.js e Microsserviços",
    speaker: "Gabriel Lima",
    topics: ["Docker", "RabbitMQ", "API Gateway"],
    attendees: 267,
    gradient: "from-green-600/20 to-emerald-600/20",
    border: "border-green-500/20",
  },
  {
    id: 4,
    date: "02 Jul",
    weekday: "Qua",
    time: "19:00",
    title: "Testes no Frontend com Vitest",
    speaker: "Camila Torres",
    topics: ["Unit Tests", "Mocking", "Coverage"],
    attendees: 198,
    gradient: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/20",
  },
  {
    id: 5,
    date: "04 Jul",
    weekday: "Sex",
    time: "20:00",
    title: "CSS Moderno: Grid e Container Queries",
    speaker: "Mariana Costa",
    topics: ["Grid", "Subgrid", "Container Q."],
    attendees: 154,
    gradient: "from-pink-600/20 to-rose-600/20",
    border: "border-pink-500/20",
  },
  {
    id: 6,
    date: "07 Jul",
    weekday: "Seg",
    time: "19:00",
    title: "React Native em 2025",
    speaker: "Lucas Ferreira",
    topics: ["Expo", "New Arch.", "Animations"],
    attendees: 321,
    gradient: "from-violet-600/20 to-purple-600/20",
    border: "border-violet-500/20",
  },
];

const recordings = [
  {
    id: 1,
    title: "Git na prática: branches e rebase",
    views: "8.4k",
    duration: "1h 12min",
    gradient: "from-orange-600/40 to-amber-600/40",
  },
  {
    id: 2,
    title: "Zustand vs Redux: qual usar?",
    views: "6.1k",
    duration: "58min",
    gradient: "from-blue-600/40 to-cyan-600/40",
  },
  {
    id: 3,
    title: "Deploy na Vercel com CI/CD",
    views: "5.7k",
    duration: "45min",
    gradient: "from-purple-600/40 to-violet-600/40",
  },
  {
    id: 4,
    title: "Acessibilidade Web para devs",
    views: "4.2k",
    duration: "1h 02min",
    gradient: "from-green-600/40 to-teal-600/40",
  },
];

const initialQuestions = [
  { id: 1, text: "Qual a diferença entre useCallback e useMemo?", votes: 34 },
  { id: 2, text: "Como evitar re-renders desnecessários?", votes: 27 },
  { id: 3, text: "Quando usar Context API vs Zustand?", votes: 19 },
  { id: 4, text: "Hooks customizados: boas práticas?", votes: 15 },
];

export default function Lives() {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState(initialQuestions);

  function handleSendQuestion() {
    const trimmed = question.trim();
    if (!trimmed) return;
    setQuestions((prev) => [
      { id: Date.now(), text: trimmed, votes: 0 },
      ...prev,
    ]);
    setQuestion("");
  }

  function handleUpvote(id: number) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Lives & Eventos</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Aprenda ao vivo com especialistas e reveja as gravações quando quiser.
        </p>
      </div>

      {/* AO VIVO AGORA Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950/60 to-rose-950/40 border border-red-500/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 flex items-center justify-center">
              <Radio className="w-6 h-6 text-red-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                AO VIVO AGORA
              </span>
            </div>
            <p className="text-white font-bold text-base">React na Prática com Hooks</p>
            <p className="text-zinc-400 text-sm flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" />
              247 espectadores · com Ana Souza
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold px-5 py-3 rounded-xl transition-all whitespace-nowrap text-sm">
          <Play className="w-4 h-4 fill-white" />
          Assistir Agora
        </button>
      </div>

      {/* Próximas Lives */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Próximas Lives
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingLives.map((live) => (
            <div
              key={live.id}
              className={`bg-gradient-to-br ${live.gradient} border ${live.border} rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-start justify-between">
                <div className="bg-zinc-900/80 rounded-xl px-3 py-2 text-center">
                  <p className="text-white font-bold text-base leading-none">{live.date}</p>
                  <p className="text-zinc-400 text-xs">{live.weekday} · {live.time}</p>
                </div>
                <div className="flex items-center gap-1 text-zinc-400 text-xs">
                  <Users className="w-3 h-3" />
                  {live.attendees}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold text-sm leading-snug">{live.title}</p>
                <p className="text-zinc-400 text-xs mt-1">com {live.speaker}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {live.topics.map((t) => (
                  <span
                    key={t}
                    className="bg-zinc-900/60 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700/50"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <button className="mt-auto w-full py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700/50 transition-colors">
                Inscrever-se
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gravações */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-400" />
          Gravações
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-colors group"
            >
              <div
                className={`h-28 bg-gradient-to-br ${rec.gradient} flex items-center justify-center`}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-5 h-5 fill-white text-white" />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-zinc-200 text-sm font-medium leading-snug">{rec.title}</p>
                <div className="flex items-center justify-between text-zinc-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {rec.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.duration}
                  </span>
                </div>
                <button className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors">
                  Assistir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Q&A ao Vivo */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Q&A ao Vivo</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <p className="text-zinc-400 text-sm">
            Envie sua pergunta para a live atual. As mais votadas serão respondidas.
          </p>

          {/* Question input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendQuestion()}
              placeholder="Sua pergunta para a live..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleSendQuestion}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Questions list */}
          <div className="space-y-2">
            {questions
              .sort((a, b) => b.votes - a.votes)
              .map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3 gap-3"
                >
                  <p className="text-zinc-300 text-sm flex-1">{q.text}</p>
                  <button
                    onClick={() => handleUpvote(q.id)}
                    className="flex items-center gap-1.5 bg-zinc-700 hover:bg-purple-600/30 text-zinc-400 hover:text-purple-300 text-xs px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {q.votes}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Code Review Ao Vivo */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-400" />
          Code Review Ao Vivo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Next Session Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Próxima Sessão</p>
                <p className="text-zinc-400 text-xs">Code Review Ao Vivo</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Segunda-feira, 30 de Junho</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span>20:00 – 21:30 (BRT)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Users className="w-4 h-4 shrink-0" />
                <span>Revisão de até 5 projetos ao vivo</span>
              </div>
            </div>
            <div className="pt-1">
              <p className="text-zinc-500 text-xs">
                Submeta seu código até 28/06 para ter chance de ser revisado ao vivo.
              </p>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center">
                <Upload className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold">Submeter Código para Review</h3>
              <p className="text-zinc-400 text-sm">
                Envie o link do seu repositório e conte o que deseja melhorar. Nossa equipe
                seleciona os projetos mais interessantes para revisar ao vivo.
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors">
              Submeter Código
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
