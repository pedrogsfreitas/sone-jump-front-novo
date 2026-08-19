import { useEffect, useState } from "react";
import { Target, Flame, Clock, Zap } from "lucide-react";
import { getSummary, getSessions, getGoals, type ProgressSummary, type StudySession, type Goal } from "../../services/progress/progress";
import { ApiError } from "../../services/api";
import { formatDate, formatDuration } from "../../utils/format";

const SKILL_COLORS = ["bg-green-500", "bg-purple-500", "bg-blue-500", "bg-yellow-500", "bg-orange-500", "bg-zinc-500"];
const SKILL_TEXT_COLORS = ["text-green-400", "text-purple-400", "text-blue-400", "text-yellow-400", "text-orange-400", "text-zinc-400"];
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Progress() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSummary(), getSessions(), getGoals()])
      .then(([s, sess, g]) => {
        setSummary(s);
        setSessions(sess);
        setGoals(g);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar progresso."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando progresso...</div>;
  if (error) return <div className="min-h-screen bg-[#050505] text-red-400 p-6">{error}</div>;
  if (!summary) return null;

  const hoursThisMonth = Math.round(
    sessions
      .filter((s) => new Date(s.occurredOn).getMonth() === new Date().getMonth())
      .reduce((sum, s) => sum + s.durationMinutes, 0) / 60,
  );

  const stats = [
    { label: "Horas Este Mês", value: `${hoursThisMonth}h`, icon: Clock, color: "text-blue-400" },
    { label: "Sessões Esta Semana", value: String(summary.sessionsThisWeek), icon: Target, color: "text-purple-400" },
    { label: "Sequência", value: `${summary.streakCurrentDays} dias`, icon: Flame, color: "text-orange-400" },
    { label: "XP Acumulado", value: summary.xpTotal.toLocaleString("pt-BR"), icon: Zap, color: "text-yellow-400" },
  ];

  // Derive "this week" from the sessions we already fetched, bucketed by weekday.
  const weekDays = WEEKDAY_LABELS.map((day, idx) => ({
    day,
    count: sessions.filter((s) => new Date(s.occurredOn).getDay() === idx).length,
  }));

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Progresso &amp; Metas</h1>
        <p className="text-zinc-400 text-sm mt-1">Acompanhe sua evolução e conquiste seus objetivos</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-zinc-400">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Evolution */}
      {summary.skills.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Evolução de Habilidades</h2>
          <div className="space-y-4">
            {summary.skills.map((skill, i) => (
              <div key={skill.name} className="flex items-center gap-4">
                <span className="w-28 text-sm text-zinc-300 shrink-0">{skill.name}</span>
                <div className="flex-1 bg-zinc-800 rounded-full h-7 overflow-hidden relative">
                  <div
                    className={`h-full ${SKILL_COLORS[i % SKILL_COLORS.length]} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                    style={{ width: `${skill.pct}%` }}
                  >
                    {skill.pct >= 15 && <span className="text-xs font-semibold text-white">{skill.pct}%</span>}
                  </div>
                </div>
                <span className={`text-sm font-semibold w-10 text-right ${SKILL_TEXT_COLORS[i % SKILL_TEXT_COLORS.length]}`}>
                  {skill.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Metas Ativas</h2>
        {goals.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhuma meta cadastrada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold text-white border-4 border-zinc-700"
                  style={{
                    background: `conic-gradient(#a855f7 ${goal.currentPct * 3.6}deg, #27272a ${goal.currentPct * 3.6}deg)`,
                  }}
                >
                  <span className="bg-zinc-900 w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold">
                    {goal.currentPct}%
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{goal.title}</p>
                </div>
                {goal.dueDate && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                    até {formatDate(goal.dueDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Sessions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Sessões de Estudo</h2>
        </div>
        {sessions.length === 0 ? (
          <p className="text-zinc-500 text-sm p-5">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 text-xs uppercase tracking-wide border-b border-zinc-800">
                  <th className="px-5 py-3 text-left">Data</th>
                  <th className="px-5 py-3 text-left">Tópico</th>
                  <th className="px-5 py-3 text-left">Duração</th>
                  <th className="px-5 py-3 text-left">XP Ganho</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3 text-zinc-400">{formatDate(s.occurredOn)}</td>
                    <td className="px-5 py-3 text-white">{s.topic}</td>
                    <td className="px-5 py-3 text-zinc-300">{formatDuration(s.durationMinutes)}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-yellow-400 font-medium">
                        <Zap className="w-3.5 h-3.5" />
                        +{s.xpEarned} XP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly Calendar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Sessões por Dia da Semana</h2>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">{d.day}</span>
              <div className="w-full min-h-16 bg-zinc-800 rounded-lg p-1.5 flex flex-col items-center justify-center gap-1">
                {d.count === 0 ? (
                  <span className="text-zinc-600 text-xs">—</span>
                ) : (
                  <span className="text-purple-400 font-bold text-lg">{d.count}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
