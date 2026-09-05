import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Zap, Flame, CheckCircle, GraduationCap } from "lucide-react";
import { getMe } from "../../services/users/users";
import { getSummary, getSessions, type ProgressSummary } from "../../services/progress/progress";
import { getRoadmap, type RoadmapNode } from "../../services/roadmap/roadmap";
import { getLives, type LiveSession } from "../../services/lives/lives";
import { ApiError } from "../../services/api";

type AchievementContext = {
  hasCareer: boolean;
  completedNodes: number;
  streakLongestDays: number;
  level: number;
};

type Achievement = { emoji: string; title: string; desc: string };

// Catálogo de conquistas possíveis — cada uma só aparece quando a condição
// bate com dados reais do usuário. Ainda não existe todo um sistema de
// conquistas no backend (com data de desbloqueio etc.), então isso é
// deduzido a partir do que já temos (progresso, roadmap): nada de conquista
// fixa que não reflete o que a pessoa realmente fez.
const ACHIEVEMENT_CATALOG: (Achievement & { isUnlocked: (ctx: AchievementContext) => boolean })[] = [
  {
    emoji: "🏆",
    title: "Primeiro Login",
    desc: "Bem-vindo ao Sone Jump!",
    isUnlocked: () => true,
  },
  {
    emoji: "🧭",
    title: "Carreira Escolhida",
    desc: "Você definiu seu roadmap!",
    isUnlocked: (ctx) => ctx.hasCareer,
  },
  {
    emoji: "✅",
    title: "Primeira Etapa",
    desc: "Você concluiu a primeira etapa da trilha!",
    isUnlocked: (ctx) => ctx.completedNodes >= 1,
  },
  {
    emoji: "⚡",
    title: "7 Dias Seguidos",
    desc: "Sequência incrível!",
    isUnlocked: (ctx) => ctx.streakLongestDays >= 7,
  },
  {
    emoji: "🎯",
    title: "Subiu de Nível",
    desc: "Você passou do nível 1!",
    isUnlocked: (ctx) => ctx.level >= 2,
  },
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SKILL_COLORS = ["bg-orange-500", "bg-yellow-500", "bg-purple-500", "bg-blue-500"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [weekActivity, setWeekActivity] = useState<boolean[]>([]);
  const [currentNode, setCurrentNode] = useState<RoadmapNode | null>(null);
  const [nextAvailableNode, setNextAvailableNode] = useState<RoadmapNode | null>(null);
  const [roadmapAllCompleted, setRoadmapAllCompleted] = useState(false);
  const [hasCareer, setHasCareer] = useState(true);
  const [completedNodes, setCompletedNodes] = useState(0);
  const [nextLive, setNextLive] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMe(), getSummary(), getSessions(), getRoadmap(), getLives()])
      .then(([me, sum, sessions, roadmap, lives]) => {
        setFirstName(me.fullName.trim().split(/\s+/)[0] ?? "");
        setSummary(sum);
        setHasCareer(roadmap.career !== null);

        setWeekActivity(
          Array.from({ length: 7 }, (_, i) => sessions.some((s) => new Date(s.occurredOn).getDay() === i)),
        );

        setCurrentNode(roadmap.nodes.find((n) => n.status === "IN_PROGRESS") ?? null);
        setNextAvailableNode(roadmap.nodes.find((n) => n.status === "AVAILABLE") ?? null);
        setRoadmapAllCompleted(
          roadmap.nodes.length > 0 && roadmap.nodes.every((n) => n.status === "COMPLETED"),
        );
        setCompletedNodes(roadmap.nodes.filter((n) => n.status === "COMPLETED").length);

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

  const unlockedAchievements = ACHIEVEMENT_CATALOG.filter((a) =>
    a.isUnlocked({ hasCareer, completedNodes, streakLongestDays: summary.streakLongestDays, level: summary.level }),
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá, {firstName}! 👋</h1>
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
        {/* Sua Semana */}
        <div className="order-1 lg:order-none lg:col-span-2 lg:row-start-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
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

        {/* Sem carreira escolhida não existe roadmap para continuar */}
        {!hasCareer && (
          <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Comece por aqui</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
                🧭
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">Escolha sua carreira</p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  O roadmap é o da carreira que você seguir
                </p>
              </div>
              <button
                onClick={() => navigate("/app/roadmap")}
                className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Escolher
              </button>
            </div>
          </div>
        )}

        {/* Continue de onde parou */}
        {hasCareer && currentNode && (
          <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
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

        {/* Terminou a etapa anterior, mas ainda não começou a próxima (que já
            está liberada) — sem isso o espaço fica vazio e desalinha o card
            de lives ao lado. */}
        {hasCareer && !currentNode && nextAvailableNode && (
          <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Próxima etapa liberada</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
                🔓
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{nextAvailableNode.name}</p>
                <p className="text-zinc-400 text-xs mt-0.5">~{nextAvailableNode.hours}h estimadas</p>
              </div>
              <button
                onClick={() => navigate("/app/roadmap")}
                className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Começar
              </button>
            </div>
          </div>
        )}

        {/* Todas as etapas concluídas — roadmap inteiro finalizado. */}
        {hasCareer && !currentNode && !nextAvailableNode && roadmapAllCompleted && (
          <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Roadmap concluído</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-600/20 border border-green-500/30 flex items-center justify-center text-2xl shrink-0">
                🎉
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">Você concluiu todas as etapas!</p>
                <p className="text-zinc-400 text-xs mt-0.5">Que tal explorar uma nova carreira?</p>
              </div>
              <button
                onClick={() => navigate("/app/careers")}
                className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Ver carreiras
              </button>
            </div>
          </div>
        )}

        {/* Próxima Sessão ao Vivo — ocupa as linhas 1 e 2 da coluna da direita
            e estica (align-items: stretch, padrão do grid) até o fim da linha
            2, que é exatamente o fim do card "Comece por aqui"/"Continue de
            onde parou" ao lado. O conteúdo do card continua no topo, então o
            card só cresce para baixo. Sempre aparece — com um estado vazio
            quando não há nenhuma live agendada, em vez de sumir da tela. */}
        <div className="order-4 lg:order-none lg:col-start-3 lg:row-start-1 lg:row-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Próxima Sessão ao Vivo</h2>
          </div>
          {nextLive ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <span className="text-3xl">📭</span>
              <p className="font-semibold text-white text-sm">Nenhuma live no radar ainda</p>
              <p className="text-zinc-500 text-xs">
                Assim que uma nova sessão ao vivo for agendada, ela aparece por aqui.
              </p>
            </div>
          )}
        </div>

        {/* Conquistas Recentes */}
        <div className="order-3 lg:order-none lg:col-span-2 lg:row-start-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Conquistas Recentes</h2>
          {unlockedAchievements.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {unlockedAchievements.map((a) => (
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
          ) : (
            <p className="text-zinc-500 text-xs">Você ainda não desbloqueou nenhuma conquista.</p>
          )}
        </div>

        {/* Habilidades em Progresso */}
        {summary.skills.length > 0 && (
          <div className="order-5 lg:order-none lg:col-start-3 lg:row-start-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
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
  );
}
