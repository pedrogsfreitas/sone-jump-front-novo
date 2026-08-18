import { Target, Flame, Clock, Zap, ChevronUp, ChevronDown } from "lucide-react";

const stats = [
  { label: "Horas Este Mês", value: "34h", icon: Clock, color: "text-blue-400" },
  { label: "Meta Semanal", value: "5/7 dias", icon: Target, color: "text-purple-400" },
  { label: "Sequência", value: "7 dias", icon: Flame, color: "text-orange-400" },
  { label: "XP Acumulado", value: "1.240", icon: Zap, color: "text-yellow-400" },
];

const skills = [
  { name: "HTML/CSS", pct: 95, color: "bg-green-500", textColor: "text-green-400" },
  { name: "JavaScript", pct: 72, color: "bg-purple-500", textColor: "text-purple-400" },
  { name: "React", pct: 45, color: "bg-blue-500", textColor: "text-blue-400" },
  { name: "TypeScript", pct: 20, color: "bg-yellow-500", textColor: "text-yellow-400" },
  { name: "Node.js", pct: 10, color: "bg-orange-500", textColor: "text-orange-400" },
  { name: "Next.js", pct: 5, color: "bg-zinc-500", textColor: "text-zinc-400" },
];

const goals = [
  { title: "Completar módulo React", pct: 45, daysLeft: 12 },
  { title: "Praticar 5 dias seguidos", pct: 71, daysLeft: 3 },
  { title: "Subir para nível 8", pct: 30, daysLeft: 20 },
];

const sessions = [
  { date: "22/06/2026", topic: "Hooks avançados do React", duration: "1h 20min", xp: 80 },
  { date: "21/06/2026", topic: "Fundamentos de TypeScript", duration: "45min", xp: 50 },
  { date: "20/06/2026", topic: "CSS Grid & Flexbox", duration: "2h 00min", xp: 120 },
  { date: "19/06/2026", topic: "Node.js: criando API REST", duration: "1h 10min", xp: 70 },
  { date: "18/06/2026", topic: "JavaScript Assíncrono", duration: "55min", xp: 60 },
  { date: "17/06/2026", topic: "HTML semântico", duration: "30min", xp: 30 },
  { date: "16/06/2026", topic: "React Router DOM v6", duration: "1h 05min", xp: 65 },
  { date: "15/06/2026", topic: "Git e GitHub na prática", duration: "40min", xp: 45 },
];

const weekDays = [
  { day: "Seg", sessions: ["purple", "blue"] },
  { day: "Ter", sessions: ["green"] },
  { day: "Qua", sessions: ["purple", "orange", "blue"] },
  { day: "Qui", sessions: [] },
  { day: "Sex", sessions: ["yellow", "purple"] },
  { day: "Sáb", sessions: ["blue"] },
  { day: "Dom", sessions: ["green", "purple"] },
];

const sessionColorMap: Record<string, string> = {
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
};

export default function Progress() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-8">
      {/* Header */}
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Evolução de Habilidades</h2>
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.name} className="flex items-center gap-4">
              <span className="w-28 text-sm text-zinc-300 shrink-0">{skill.name}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-7 overflow-hidden relative">
                <div
                  className={`h-full ${skill.color} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                  style={{ width: `${skill.pct}%` }}
                >
                  {skill.pct >= 15 && (
                    <span className="text-xs font-semibold text-white">{skill.pct}%</span>
                  )}
                </div>
              </div>
              <span className={`text-sm font-semibold w-10 text-right ${skill.textColor}`}>{skill.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Metas Ativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div key={goal.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col items-center gap-4">
              {/* Circle Progress */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold text-white border-4 border-zinc-700"
                style={{
                  background: `conic-gradient(#a855f7 ${goal.pct * 3.6}deg, #27272a ${goal.pct * 3.6}deg)`,
                }}
              >
                <span className="bg-zinc-900 w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold">
                  {goal.pct}%
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">{goal.title}</p>
              </div>
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                {goal.daysLeft} dias restantes
              </span>
              <button className="w-full text-sm border border-zinc-700 text-zinc-300 hover:border-purple-500 hover:text-purple-400 rounded-lg py-2 transition-colors">
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Study Sessions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Sessões de Estudo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 text-xs uppercase tracking-wide border-b border-zinc-800">
                <th className="px-5 py-3 text-left">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    Data <ChevronDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    Tópico <ChevronUp className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    Duração <ChevronDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    XP Ganho <ChevronDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-5 py-3 text-zinc-400">{s.date}</td>
                  <td className="px-5 py-3 text-white">{s.topic}</td>
                  <td className="px-5 py-3 text-zinc-300">{s.duration}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-yellow-400 font-medium">
                      <Zap className="w-3.5 h-3.5" />
                      +{s.xp} XP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Semana Atual</h2>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">{d.day}</span>
              <div className="w-full min-h-16 bg-zinc-800 rounded-lg p-1.5 flex flex-col gap-1">
                {d.sessions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-zinc-600 text-xs">—</span>
                  </div>
                ) : (
                  d.sessions.map((color, i) => (
                    <div
                      key={i}
                      className={`w-full h-4 rounded ${sessionColorMap[color]} opacity-80`}
                    />
                  ))
                )}
              </div>
              {d.sessions.length > 0 && (
                <span className="text-xs text-zinc-500">{d.sessions.length} sess.</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
          {Object.entries(sessionColorMap).map(([name, cls]) => (
            <span key={name} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${cls}`} />
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
