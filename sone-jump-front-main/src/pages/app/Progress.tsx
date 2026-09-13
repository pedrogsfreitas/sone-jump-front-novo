import { useEffect, useState, type FormEvent } from "react";
import { Target, Flame, Clock, Zap, Plus, X, Minus, Trash2 } from "lucide-react";
import {
  getSummary,
  getSessions,
  getGoals,
  logSession,
  createGoal,
  updateGoal,
  deleteGoal,
  type ProgressSummary,
  type StudySession,
  type Goal,
} from "../../services/progress/progress";
import { ApiError } from "../../services/api";
import { formatDate, formatDuration } from "../../utils/format";

// `toISOString()` converte pra UTC — em qualquer horário da noite aqui no Brasil
// (UTC-3), isso já é "amanhã" em UTC, e as datas mínima/máxima do campo de data
// ficavam um dia deslocadas do que a pessoa via na tela. Monta a data a partir
// dos componentes locais, do mesmo jeito que o próprio input já mostra.
function toDateInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayStr(): string {
  return toDateInputValue(new Date());
}

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toDateInputValue(d);
}

/** Só dígitos, sem zero à esquerda (exceto quando o campo é só "0") — sem isso,
 * digitar em cima de um valor existente vira "030" em vez de substituir. */
function sanitizeDigits(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  return digits.replace(/^0+(?=\d)/, "");
}

const SKILL_COLORS = ["bg-green-500", "bg-purple-500", "bg-blue-500", "bg-yellow-500", "bg-orange-500", "bg-zinc-500"];
const SKILL_TEXT_COLORS = ["text-green-400", "text-purple-400", "text-blue-400", "text-yellow-400", "text-orange-400", "text-zinc-400"];
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Progress() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Nova meta
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDueDate, setGoalDueDate] = useState("");
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [goalError, setGoalError] = useState("");

  // Registrar sessão de estudo
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState("30");
  const [sessionTag, setSessionTag] = useState("");
  const [sessionDate, setSessionDate] = useState(todayStr());
  const [loggingSession, setLoggingSession] = useState(false);
  const [sessionError, setSessionError] = useState("");

  // Ações por meta (ajustar % / apagar)
  const [goalActionId, setGoalActionId] = useState<number | null>(null);
  const [goalActionError, setGoalActionError] = useState("");

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

  function closeGoalModal() {
    setShowGoalModal(false);
    setGoalError("");
    setGoalTitle("");
    setGoalDueDate("");
  }

  async function handleCreateGoal(e: FormEvent) {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setGoalError("");
    setCreatingGoal(true);
    try {
      // Sem targetPct: o back já usa 100 como padrão quando omitido, e não
      // existe hoje nenhuma tela que mostre uma meta com alvo diferente de
      // 100% — pedir isso só confundia sem servir pra nada.
      const goal = await createGoal({
        title: goalTitle.trim(),
        dueDate: goalDueDate || undefined,
      });
      setGoals((prev) => [...prev, goal]);
      closeGoalModal();
    } catch (e) {
      setGoalError(e instanceof ApiError ? e.message : "Erro ao criar meta.");
    } finally {
      setCreatingGoal(false);
    }
  }

  function closeSessionModal() {
    setShowSessionModal(false);
    setSessionError("");
    setSessionTopic("");
    setSessionMinutes("30");
    setSessionTag("");
    setSessionDate(todayStr());
  }

  async function handleLogSession(e: FormEvent) {
    e.preventDefault();
    const minutes = Number(sessionMinutes);
    if (!sessionTopic.trim() || !minutes) return;

    setSessionError("");
    setLoggingSession(true);
    try {
      const session = await logSession({
        topic: sessionTopic.trim(),
        durationMinutes: minutes,
        subjectTag: sessionTag.trim() || undefined,
        occurredOn: sessionDate || undefined,
      });
      // O back já devolve a lista ordenada por data (mais recente primeiro), mas só
      // colocar a sessão nova no topo bagunçava essa ordem quando a data dela não
      // era a mais recente — reordena de novo depois de inserir.
      setSessions((prev) =>
        [session, ...prev].sort(
          (a, b) => new Date(b.occurredOn).getTime() - new Date(a.occurredOn).getTime(),
        ),
      );
      // Duração e sequência mudam no servidor ao registrar uma sessão — busca de
      // novo em vez de tentar recalcular isso aqui (XP e streak nunca são
      // confiados do cliente).
      const freshSummary = await getSummary();
      setSummary(freshSummary);
      closeSessionModal();
    } catch (e) {
      setSessionError(e instanceof ApiError ? e.message : "Erro ao registrar sessão.");
    } finally {
      setLoggingSession(false);
    }
  }

  async function handleAdjustGoal(goal: Goal, delta: number) {
    const nextPct = Math.max(0, Math.min(100, goal.currentPct + delta));
    if (nextPct === goal.currentPct) return;

    setGoalActionError("");
    setGoalActionId(goal.id);
    try {
      const updated = await updateGoal(goal.id, nextPct);
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
    } catch (e) {
      setGoalActionError(e instanceof ApiError ? e.message : "Erro ao atualizar meta.");
    } finally {
      setGoalActionId(null);
    }
  }

  async function handleDeleteGoal(goal: Goal) {
    setGoalActionError("");
    setGoalActionId(goal.id);
    try {
      await deleteGoal(goal.id);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    } catch (e) {
      setGoalActionError(e instanceof ApiError ? e.message : "Erro ao apagar meta.");
    } finally {
      setGoalActionId(null);
    }
  }

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Metas Ativas</h2>
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Nova meta
          </button>
        </div>

        {goalActionError && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            {goalActionError}
          </div>
        )}

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

                <div className="flex items-center gap-2 w-full pt-1">
                  <button
                    onClick={() => handleAdjustGoal(goal, -10)}
                    disabled={goalActionId === goal.id || goal.currentPct <= 0}
                    className="flex-1 flex items-center justify-center p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition-colors"
                    title="-10%"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => handleAdjustGoal(goal, 10)}
                    disabled={goalActionId === goal.id || goal.currentPct >= 100}
                    className="flex-1 flex items-center justify-center p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition-colors"
                    title="+10%"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal)}
                    disabled={goalActionId === goal.id}
                    className="flex items-center justify-center p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 disabled:opacity-40 transition-colors"
                    title="Apagar meta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Sessions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Sessões de Estudo</h2>
          <button
            onClick={() => setShowSessionModal(true)}
            className="shrink-0 flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Registrar sessão
          </button>
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

      {/* Modal de nova meta */}
      {showGoalModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeGoalModal}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateGoal}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Nova meta</h3>
              <button
                type="button"
                onClick={closeGoalModal}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={15} className="text-zinc-400" />
              </button>
            </div>

            {goalError && (
              <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {goalError}
              </div>
            )}

            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Título da meta</label>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Ex.: Terminar o módulo de React"
              maxLength={140}
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />

            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Prazo (opcional)</label>
            <input
              type="date"
              value={goalDueDate}
              min={todayStr()}
              onChange={(e) => setGoalDueDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 mb-5 text-sm focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
            />

            <button
              type="submit"
              disabled={creatingGoal || !goalTitle.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {creatingGoal ? "Criando..." : "Criar meta"}
            </button>
          </form>
        </div>
      )}

      {/* Modal de registrar sessão de estudo */}
      {showSessionModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeSessionModal}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleLogSession}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Registrar sessão de estudo</h3>
              <button
                type="button"
                onClick={closeSessionModal}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={15} className="text-zinc-400" />
              </button>
            </div>

            {sessionError && (
              <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {sessionError}
              </div>
            )}

            <label className="block text-xs font-medium text-zinc-400 mb-1.5">O que você estudou?</label>
            <input
              type="text"
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              placeholder="Ex.: Hooks do React"
              maxLength={120}
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />

            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Duração (minutos)</label>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSessionMinutes((m) => String(Math.max(1, Number(m || 0) - 5)))}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <Minus size={14} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(sanitizeDigits(e.target.value))}
                onBlur={() => setSessionMinutes((m) => (m === "" ? "1" : m))}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-center rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setSessionMinutes((m) => String(Math.min(600, Number(m || 0) + 5)))}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tag (opcional)</label>
            <input
              type="text"
              value={sessionTag}
              onChange={(e) => setSessionTag(e.target.value)}
              placeholder="Ex.: React, SQL, Docker..."
              maxLength={40}
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />

            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Data</label>
            <input
              type="date"
              value={sessionDate}
              min={daysAgoStr(3)}
              max={todayStr()}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 mb-1 text-sm focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
            />
            <p className="text-xs text-zinc-500 mb-5">Só é possível registrar sessões de até 3 dias atrás.</p>

            <button
              type="submit"
              disabled={loggingSession || !sessionTopic.trim() || Number(sessionMinutes) < 1}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {loggingSession ? "Registrando..." : "Registrar sessão"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
