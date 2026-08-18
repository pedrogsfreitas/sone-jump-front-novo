import { Bell, Zap, Flame, CheckCircle, Trophy } from "lucide-react";

const WEEK_DAYS = [
  { label: "Seg", completed: true },
  { label: "Ter", completed: true },
  { label: "Qua", completed: true },
  { label: "Qui", completed: true },
  { label: "Sex", completed: false, today: true },
  { label: "Sáb", completed: false },
  { label: "Dom", completed: false },
];

const ACHIEVEMENTS = [
  { emoji: "🏆", title: "Primeiro Login", desc: "Bem-vindo ao Sone Jump!" },
  { emoji: "⚡", title: "7 Dias Seguidos", desc: "Sequência incrível!" },
  { emoji: "🎯", title: "Meta Semanal", desc: "Você bateu a meta!" },
];

const SKILLS = [
  { name: "HTML/CSS", pct: 95, color: "bg-orange-500" },
  { name: "JavaScript", pct: 72, color: "bg-yellow-500" },
  { name: "React", pct: 45, color: "bg-purple-500" },
  { name: "TypeScript", pct: 20, color: "bg-blue-500" },
];

export default function Dashboard() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateCapitalized =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá, João! 👋</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{dateCapitalized}</p>
        </div>
        <button className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition-colors">
          <Bell size={20} className="text-zinc-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
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
            <p className="text-xl font-bold text-white">1.240</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Flame size={22} className="text-orange-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs">Sequência</p>
            <p className="text-xl font-bold text-white">7 dias 🔥</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <CheckCircle size={22} className="text-green-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs">Skills Concluídas</p>
            <p className="text-xl font-bold text-white">12</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <Trophy size={22} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs">Ranking</p>
            <p className="text-xl font-bold text-white">#34</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sua Semana */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">
              Sua Semana
            </h2>
            <div className="flex items-center justify-between">
              {WEEK_DAYS.map((day) => (
                <div key={day.label} className="flex flex-col items-center gap-2">
                  <span className="text-zinc-500 text-xs">{day.label}</span>
                  <div
                    className={
                      day.today
                        ? "w-9 h-9 rounded-full border-2 border-purple-500 flex items-center justify-center animate-pulse bg-purple-500/20"
                        : day.completed
                        ? "w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center"
                        : "w-9 h-9 rounded-full border-2 border-zinc-700 flex items-center justify-center"
                    }
                  >
                    {day.completed && (
                      <CheckCircle size={16} className="text-white" />
                    )}
                    {day.today && (
                      <span className="w-2 h-2 bg-purple-400 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue de onde parou */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">
              Continue de onde parou
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
                ⚛️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">React Hooks Avançados</p>
                <p className="text-zinc-400 text-xs mt-0.5">Módulo 3 de 5</p>
                <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                    style={{ width: "68%" }}
                  />
                </div>
                <p className="text-zinc-500 text-xs mt-1">68% concluído</p>
              </div>
              <button className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                Continuar
              </button>
            </div>
          </div>

          {/* Conquistas Recentes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">
              Conquistas Recentes
            </h2>
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-300">
                Próxima Sessão ao Vivo
              </h2>
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </div>
            <div className="w-full h-24 rounded-xl bg-gradient-to-br from-purple-900/60 to-zinc-900 border border-purple-500/20 flex items-center justify-center mb-3">
              <span className="text-3xl">🎙️</span>
            </div>
            <p className="font-semibold text-white">React na Prática</p>
            <p className="text-zinc-400 text-xs mt-1">Seg, 23 Jun · 19h00</p>
            <button className="mt-3 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-xl transition-colors">
              Participar
            </button>
          </div>

          {/* Habilidades em Progresso */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">
              Habilidades em Progresso
            </h2>
            <div className="space-y-3">
              {SKILLS.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300">{skill.name}</span>
                    <span className="text-zinc-500">{skill.pct}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.color} rounded-full transition-all`}
                      style={{ width: `${skill.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
