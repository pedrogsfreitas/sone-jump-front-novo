import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Zap, Flame, CheckCircle, GraduationCap } from "lucide-react";
import { getSummary, getSessions, type ProgressSummary } from "../../services/progress/progress";
import { getRoadmap, type RoadmapNode } from "../../services/roadmap/roadmap";
import { getLives, type LiveSession } from "../../services/lives/lives";
import { ApiError } from "../../services/api";

// No backend model for badges/achievements yet (no "unlocked at" data to show real
// ones) — kept as static placeholder content until that's designed, per the Fase 7
// scope decision to not invent new backend features while wiring pages.
const ACHIEVEMENTS = [
  { emoji: "🏆", title: "Primeiro Login", desc: "Bem-vindo ao Sone Jump!" },
  { emoji: "⚡", title: "7 Dias Seguidos", desc: "Sequência incrível!" },
  { emoji: "🎯", title: "Meta Semanal", desc: "Você bateu a meta!" },
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SKILL_COLORS = ["bg-orange-500", "bg-yellow-500", "bg-purple-500", "bg-blue-500"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [weekActivity, setWeekActivity] = useState<boolean[]>([]);
  const [currentNode, setCurrentNode] = useState<RoadmapNode | null>(null);
  const [completedNodes, setCompletedNodes] = useState(0);
  const [nextLive, setNextLive] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSummary(), getSessions(), getRoadmap(), getLives()])
      .then(([sum, sessions, nodes, lives]) => {
        setSummary(sum);

        setWeekActivity(
          Array.from({ length: 7 }, (_, i) => sessions.some((s) => new Date(s.occurredOn).getDay() === i)),
        );

        setCurrentNode(nodes.find((n) => n.status === "IN_PROGRESS") ?? null);
        setCompletedNodes(nodes.filter((n) => n.status === "COMPLETED").length);

        const upcoming = lives
          .filter((l) => l.status === "AGENDADA")
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setNextLive(upcoming[0] ?? null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const todayIdx = today.getDay();

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando dashboard...</div>;
  if (error) return <div className="min-h-screen bg-[#050505] text-red-400 p-6">{error}</div>;
  if (!summary) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá! 👋</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{dateCapitalized}</p>
        </div>
        <button className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition-colors">
          <Bell size={20} className="text-zinc-400" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <Zap size={22} className="text-purple-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs">XP Total</p>
            <p className="text-xl font-bold text-white">{summary.xpTotal.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Flame size={22} className="text-orange-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs">Sequência</p>
            <p className="text-xl font-bold text-white">{summary.streakCurrentDays} dias 🔥</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <CheckCircle size={22} className="text-green-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs">Etapas Concluídas</p>
            <p className="text-xl font-bold text-white">{completedNodes}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <GraduationCap size={22} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs">Nível</p>
            <p className="text-xl font-bold text-white">{summary.level}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sua Semana */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Sua Semana</h2>
            <div className="flex items-center justify-between">
              {WEEKDAY_LABELS.map((label, i) => {
                const isToday = i === todayIdx;
                const hadActivity = weekActivity[i];
                return (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <span className="text-zinc-500 text-xs">{label}</span>
                    <div
                      className={
                        isToday
                          ? "w-9 h-9 rounded-full border-2 border-purple-500 flex items-center justify-center animate-pulse bg-purple-500/20"
                          : hadActivity
                          ? "w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center"
                          : "w-9 h-9 rounded-full border-2 border-zinc-700 flex items-center justify-center"
                      }
                    >
                      {hadActivity && !isToday && <CheckCircle size={16} className="text-white" />}
                      {isToday && <span className="w-2 h-2 bg-purple-400 rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue de onde parou */}
          {currentNode && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Continue de onde parou</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
                  ⚛️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{currentNode.name}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">~{currentNode.hours}h estimadas</p>
                </div>
                <button
                  onClick={() => navigate("/app/roadmap")}
                  className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Conquistas Recentes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Conquistas Recentes</h2>
            <div className="grid grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((a) => (
                <div
                  key={a.title}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 flex flex-col items-center text-center gap-2"
                >
                  <span className="text-3xl">{a.emoji}</span>
                  <p className="text-xs font-semibold text-white">{a.title}</p>
                  <p className="text-zinc-500 text-xs">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Próxima Sessão ao Vivo */}
          {nextLive && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-300">Próxima Sessão ao Vivo</h2>
              </div>
              <div className="w-full h-24 rounded-xl bg-gradient-to-br from-purple-900/60 to-zinc-900 border border-purple-500/20 flex items-center justify-center mb-3">
                <span className="text-3xl">🎙️</span>
              </div>
              <p className="font-semibold text-white">{nextLive.title}</p>
              <p className="text-zinc-400 text-xs mt-1">
                {new Date(nextLive.scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </p>
              <button
                onClick={() => navigate("/app/lives")}
                className="mt-3 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-xl transition-colors"
              >
                Ver Detalhes
              </button>
            </div>
          )}

          {/* Habilidades em Progresso */}
          {summary.skills.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Habilidades em Progresso</h2>
              <div className="space-y-3">
                {summary.skills.map((skill, i) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">{skill.name}</span>
                      <span className="text-zinc-500">{skill.pct}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${SKILL_COLORS[i % SKILL_COLORS.length]} rounded-full transition-all`}
                        style={{ width: `${skill.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
