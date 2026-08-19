import { useEffect, useState } from "react";
import { Radio, Users, Calendar, Play, Eye, Clock, ThumbsUp, Send } from "lucide-react";
import {
  getLives,
  getRecordings,
  getQuestions,
  addQuestion,
  upvoteQuestion,
  type LiveSession,
  type Recording,
  type LiveQuestion,
} from "../../services/lives/lives";
import { ApiError } from "../../services/api";
import { formatDuration } from "../../utils/format";

function formatUpcoming(iso: string): { date: string; weekday: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    weekday: d.toLocaleDateString("pt-BR", { weekday: "short" }),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function Lives() {
  const [lives, setLives] = useState<LiveSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);

  const liveNow = lives.find((l) => l.status === "AO_VIVO") ?? null;
  const upcomingLives = lives
    .filter((l) => l.status === "AGENDADA")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  useEffect(() => {
    Promise.all([getLives(), getRecordings()])
      .then(([l, r]) => {
        setLives(l);
        setRecordings(r);
        const live = l.find((s) => s.status === "AO_VIVO");
        if (live) return getQuestions(live.id).then(setQuestions);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar lives."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSendQuestion() {
    const trimmed = question.trim();
    if (!trimmed || !liveNow) return;
    setSending(true);
    try {
      const created = await addQuestion(liveNow.id, trimmed);
      setQuestions((prev) => [...prev, created]);
      setQuestion("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao enviar pergunta.");
    } finally {
      setSending(false);
    }
  }

  async function handleUpvote(questionId: number) {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, votes: q.votes + 1 } : q)));
    try {
      await upvoteQuestion(questionId);
    } catch (e) {
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, votes: q.votes - 1 } : q)));
      setError(e instanceof ApiError ? e.message : "Erro ao votar.");
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando lives...</div>;

  return (
    <div className="min-h-screen bg-[#050505] p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Lives & Eventos</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Aprenda ao vivo com especialistas e reveja as gravações quando quiser.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* AO VIVO AGORA Banner */}
      {liveNow ? (
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
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">AO VIVO AGORA</span>
              </div>
              <p className="text-white font-bold text-base">{liveNow.title}</p>
              <p className="text-zinc-400 text-sm flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3" />
                {liveNow.viewerCount} espectadores · com {liveNow.host.fullName}
              </p>
            </div>
          </div>
          {liveNow.videoUrl && (
            <a
              href={liveNow.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold px-5 py-3 rounded-xl transition-all whitespace-nowrap text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Assistir Agora
            </a>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-center text-sm text-zinc-500">
          Nenhuma live ao vivo agora.
        </div>
      )}

      {/* Próximas Lives */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Próximas Lives
        </h2>
        {upcomingLives.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma live agendada no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingLives.map((live) => {
              const when = formatUpcoming(live.scheduledAt);
              return (
                <div
                  key={live.id}
                  className="bg-gradient-to-br from-purple-600/10 to-violet-600/10 border border-purple-500/20 rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-start justify-between">
                    <div className="bg-zinc-900/80 rounded-xl px-3 py-2 text-center">
                      <p className="text-white font-bold text-base leading-none capitalize">{when.date}</p>
                      <p className="text-zinc-400 text-xs capitalize">{when.weekday} · {when.time}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold text-sm leading-snug">{live.title}</p>
                    <p className="text-zinc-400 text-xs mt-1">com {live.host.fullName}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {live.topics.map((t) => (
                      <span key={t} className="bg-zinc-900/60 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gravações */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-400" />
          Gravações
        </h2>
        {recordings.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma gravação disponível ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-colors group"
              >
                <div className="h-28 bg-gradient-to-br from-purple-600/30 to-violet-600/30 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-zinc-200 text-sm font-medium leading-snug">{rec.title}</p>
                  <div className="flex items-center justify-between text-zinc-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {rec.viewCount.toLocaleString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(rec.durationMinutes)}
                    </span>
                  </div>
                  <a
                    href={rec.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                  >
                    Assistir
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Q&A ao Vivo */}
      {liveNow && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Q&A ao Vivo</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <p className="text-zinc-400 text-sm">
              Envie sua pergunta para a live atual. As mais votadas aparecem primeiro.
            </p>

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
                disabled={!question.trim() || sending}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[...questions]
                .sort((a, b) => b.votes - a.votes)
                .map((q) => (
                  <div key={q.id} className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3 gap-3">
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
      )}
    </div>
  );
}
