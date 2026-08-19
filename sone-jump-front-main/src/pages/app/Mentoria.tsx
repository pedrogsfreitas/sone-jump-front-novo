import { useEffect, useState } from "react";
import {
  Star,
  Video,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { getMentors, type Mentor } from "../../services/mentors/mentors";
import {
  getMySessions,
  requestSession,
  cancelSession,
  type MentorshipSession,
} from "../../services/mentorship-sessions/mentorship-sessions";
import { ApiError } from "../../services/api";
import { formatDate } from "../../utils/format";

type Tab = "encontrar" | "minhas" | "primeiro";

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

function formatPrice(cents: number | null, currency: string): { text: string; style: string } {
  if (cents === null || cents === 0) return { text: "Grátis", style: "text-green-400" };
  const value = (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 });
  return { text: `${currency === "BRL" ? "R$" : currency} ${value}/hora`, style: "text-purple-400" };
}

const STATUS_LABEL: Record<MentorshipSession["status"], { text: string; className: string }> = {
  SOLICITADA: { text: "Aguardando confirmação", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  CONFIRMADA: { text: "Confirmada", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  CONCLUIDA: { text: "Concluída", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  CANCELADA: { text: "Cancelada", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const cvChecklist = [
  "Foto profissional",
  "Resumo objetivo",
  "Stack listada",
  "Projetos com links",
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"}`}
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
        {open ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />}
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
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [requestFormFor, setRequestFormFor] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [topic, setTopic] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestedOk, setRequestedOk] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getMentors(), getMySessions()])
      .then(([m, s]) => {
        setMentors(m);
        setSessions(s);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar mentoria."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRequestSession(mentorId: number) {
    if (!scheduledAt) return;
    setRequesting(true);
    try {
      await requestSession({
        mentorId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        topic: topic.trim() || undefined,
      });
      const fresh = await getMySessions();
      setSessions(fresh);
      setRequestFormFor(null);
      setScheduledAt("");
      setTopic("");
      setRequestedOk(mentorId);
      setTimeout(() => setRequestedOk(null), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao solicitar mentoria.");
    } finally {
      setRequesting(false);
    }
  }

  async function handleCancel(sessionId: number) {
    try {
      // cancelSession()'s response is a raw Prisma row without the `mentor`
      // relation — refetch the full list instead of splicing it into state.
      await cancelSession(sessionId);
      const fresh = await getMySessions();
      setSessions(fresh);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao cancelar sessão.");
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando mentoria...</div>;

  const upcoming = sessions
    .filter((s) => s.status === "SOLICITADA" || s.status === "CONFIRMADA")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  const history = sessions.filter((s) => s.id !== upcoming?.id);

  return (
    <div className="min-h-screen bg-[#050505] p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mentoria</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Acelere sua carreira com mentores experientes do mercado tech.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

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
              tab === t.id ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Encontrar Mentor ── */}
      {tab === "encontrar" && (
        <div className="space-y-5">
          {mentors.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center text-sm text-zinc-500">
              Nenhum mentor disponível no momento.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => {
              const price = formatPrice(m.hourlyPriceCents, m.currency);
              return (
                <div
                  key={m.userId}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${avatarClass(m.avatarColor)} flex items-center justify-center text-white font-bold text-lg`}>
                      {initial(m.name)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{m.name}</p>
                      {m.headline && <p className="text-zinc-400 text-xs">{m.headline}</p>}
                      {m.companyName && <p className="text-zinc-500 text-xs">{m.companyName}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {m.specialties.map((s) => (
                      <span key={s} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <StarRating rating={m.rating} />
                    <span className="text-zinc-500 text-xs">{m.sessionsCount} mentorias realizadas</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${price.style}`}>{price.text}</span>
                    {requestedOk === m.userId ? (
                      <span className="text-green-400 text-xs font-semibold">Solicitação enviada!</span>
                    ) : (
                      <button
                        onClick={() => setRequestFormFor(requestFormFor === m.userId ? null : m.userId)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        Solicitar Mentoria
                      </button>
                    )}
                  </div>

                  {requestFormFor === m.userId && (
                    <div className="pt-3 border-t border-zinc-800 space-y-2">
                      <label className="text-zinc-400 text-xs block">Data e horário</label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <label className="text-zinc-400 text-xs block">Tema (opcional)</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Revisão de portfólio"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <button
                        onClick={() => handleRequestSession(m.userId)}
                        disabled={!scheduledAt || requesting}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        {requesting ? "Enviando..." : "Confirmar Solicitação"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Minhas Mentorias ── */}
      {tab === "minhas" && (
        <div className="space-y-6">
          {/* Active Session */}
          {upcoming ? (
            <div className="bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${avatarClass(upcoming.mentor.user.avatarColor)} flex items-center justify-center text-white font-bold text-lg`}>
                  {initial(upcoming.mentor.user.fullName)}
                </div>
                <div>
                  <p className="text-white font-semibold">{upcoming.mentor.user.fullName}</p>
                  {upcoming.topic && <p className="text-zinc-400 text-sm">{upcoming.topic}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(upcoming.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(upcoming.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {upcoming.durationMinutes}min
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {upcoming.status === "CONFIRMADA" && upcoming.meetingUrl ? (
                  <a
                    href={upcoming.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Entrar na Reunião
                  </a>
                ) : (
                  <span className={`text-xs px-3 py-1.5 rounded-full border ${STATUS_LABEL[upcoming.status].className}`}>
                    {STATUS_LABEL[upcoming.status].text}
                  </span>
                )}
                <button
                  onClick={() => handleCancel(upcoming.id)}
                  className="text-xs text-zinc-400 hover:text-red-400 px-3 py-1.5 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center text-sm text-zinc-500">
              Nenhuma mentoria agendada. Que tal encontrar um mentor?
            </div>
          )}

          {/* Session History */}
          {history.length > 0 && (
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
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((s, i) => (
                      <tr key={s.id} className={i < history.length - 1 ? "border-b border-zinc-800" : ""}>
                        <td className="px-4 py-3 text-zinc-200">{s.mentor.user.fullName}</td>
                        <td className="px-4 py-3 text-zinc-400">{s.topic ?? "—"}</td>
                        <td className="px-4 py-3 text-zinc-400">{formatDate(s.scheduledAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_LABEL[s.status].className}`}>
                            {STATUS_LABEL[s.status].text}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Primeiro Emprego (conteúdo de referência, estático) ── */}
      {tab === "primeiro" && (
        <div className="space-y-5">
          {/* CV Review */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Checklist de Currículo</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Pontos essenciais para verificar no seu CV antes de enviar para vagas.
            </p>
            <div className="space-y-2">
              {cvChecklist.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Tips Accordion */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Dicas para Entrevistas</h3>
            </div>
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
