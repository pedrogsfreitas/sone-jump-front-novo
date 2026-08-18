import { useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Send,
  Trophy,
  Users,
  Calendar,
  Briefcase,
  Star,
  Flame,
  BookOpen,
} from "lucide-react";

const posts = [
  {
    id: 1,
    name: "Ana Beatriz",
    initial: "A",
    color: "bg-purple-600",
    time: "há 2 horas",
    type: "achievement",
    content: "🏆 Acabei de desbloquear o selo de JavaScript Essencial! Foram semanas de dedicação mas valeu muito. Obrigada comunidade pelo apoio!",
    likes: 34,
    comments: 8,
    shares: 3,
  },
  {
    id: 2,
    name: "Carlos Eduardo",
    initial: "C",
    color: "bg-blue-600",
    time: "há 4 horas",
    type: "course",
    content: "✅ Concluí o módulo de React Hooks! Context API, useReducer e useCallback agora fazem muito mais sentido. Próxima parada: TypeScript 🚀",
    likes: 21,
    comments: 5,
    shares: 1,
  },
  {
    id: 3,
    name: "Mariana Souza",
    initial: "M",
    color: "bg-green-600",
    time: "há 6 horas",
    type: "streak",
    content: "🔥 14 dias de sequência! Nunca estudei tanto na minha vida. A plataforma me ajudou a criar o hábito que eu sempre precisei. Quem mais está na sequência?",
    likes: 58,
    comments: 14,
    shares: 7,
  },
  {
    id: 4,
    name: "Felipe Rocha",
    initial: "F",
    color: "bg-orange-600",
    time: "há 10 horas",
    type: "achievement",
    content: "🎯 Finalizei meu primeiro projeto do portfolio: um dashboard de finanças com React + Recharts. Deixei o link no meu perfil. Feedback é bem-vindo!",
    likes: 45,
    comments: 12,
    shares: 5,
  },
  {
    id: 5,
    name: "Juliana Lima",
    initial: "J",
    color: "bg-pink-600",
    time: "há 1 dia",
    type: "course",
    content: "📚 Terminei o curso de Node.js e API REST. Consegui deployar minha primeira API no Railway. Senti que virei uma dev de verdade hoje 😄",
    likes: 67,
    comments: 20,
    shares: 9,
  },
];

const topUsers = [
  { name: "Pedro Alves", xp: 4850, initial: "P", color: "bg-yellow-500", medal: "🥇" },
  { name: "Larissa Costa", xp: 4210, initial: "L", color: "bg-zinc-400", medal: "🥈" },
  { name: "Renato Dias", xp: 3980, initial: "R", color: "bg-orange-500", medal: "🥉" },
  { name: "Sofia Martins", xp: 3540, initial: "S", color: "bg-purple-500", medal: "4º" },
  { name: "Thiago Nunes", xp: 3120, initial: "T", color: "bg-blue-500", medal: "5º" },
];

const groups = [
  { name: "Frontend", icon: "⚛️", members: 1240, color: "text-blue-400" },
  { name: "Backend", icon: "🖥️", members: 890, color: "text-green-400" },
  { name: "Data Science", icon: "📊", members: 670, color: "text-yellow-400" },
  { name: "DevOps", icon: "🔧", members: 430, color: "text-orange-400" },
];

const upcomingSessions = [
  { title: "Live: Construindo uma API com Fastify", date: "Seg, 24 Jun", time: "19h00" },
  { title: "Workshop: TypeScript do Zero ao Deploy", date: "Qua, 26 Jun", time: "20h00" },
];

const jobs = [
  { company: "Nubank", role: "Frontend Dev Jr", tag: "Remoto" },
  { company: "iFood", role: "React Developer", tag: "Híbrido" },
  { company: "Totvs", role: "Fullstack Jr", tag: "SP" },
];

const postTypeIcon: Record<string, React.ReactNode> = {
  achievement: <Trophy className="w-3.5 h-3.5 text-yellow-400" />,
  course: <BookOpen className="w-3.5 h-3.5 text-blue-400" />,
  streak: <Flame className="w-3.5 h-3.5 text-orange-400" />,
};

export default function Community() {
  const [postText, setPostText] = useState("");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Comunidade</h1>
        <p className="text-zinc-400 text-sm mt-1">Compartilhe conquistas, conecte-se e cresça junto</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Post Composer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Compartilhe uma conquista, aprendizado ou dúvida..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                disabled={!postText.trim()}
              >
                <Send className="w-4 h-4" />
                Publicar
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          {posts.map((post) => (
            <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              {/* Post Header */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${post.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {post.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{post.name}</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      {postTypeIcon[post.type]}
                      {post.type === "achievement" && "Conquista"}
                      {post.type === "course" && "Curso"}
                      {post.type === "streak" && "Sequência"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{post.time}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm text-zinc-200 leading-relaxed">{post.content}</p>

              {/* Reactions */}
              <div className="flex items-center gap-1 pt-1 border-t border-zinc-800">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    liked.has(post.id)
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {post.likes + (liked.has(post.id) ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                  <Repeat2 className="w-3.5 h-3.5" />
                  {post.shares}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-5">
          {/* Top Ranking */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-white">Top Ranking</h3>
            </div>
            <div className="space-y-3">
              {topUsers.map((u) => (
                <div key={u.name} className="flex items-center gap-3">
                  <span className="text-sm w-6 text-center">{u.medal}</span>
                  <div className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {u.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{u.name}</p>
                    <p className="text-xs text-zinc-500">{u.xp.toLocaleString("pt-BR")} XP</p>
                  </div>
                  <Star className="w-3.5 h-3.5 text-yellow-500/60" />
                </div>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Grupos por Trilha</h3>
            </div>
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.name} className="flex items-center gap-3">
                  <span className="text-lg">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">{g.name}</p>
                    <p className="text-xs text-zinc-500">{g.members.toLocaleString("pt-BR")} membros</p>
                  </div>
                  <button className="text-xs border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-3 py-1 rounded-full transition-colors">
                    Entrar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Próximas Sessões</h3>
            </div>
            <div className="space-y-3">
              {upcomingSessions.map((s) => (
                <div key={s.title} className="bg-zinc-800 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-white leading-snug">{s.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{s.date} · {s.time}</span>
                    <button className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-full transition-colors">
                      Participar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jobs Board */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Vagas Compartilhadas</h3>
            </div>
            <div className="space-y-3">
              {jobs.map((j) => (
                <div key={j.role + j.company} className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{j.role}</p>
                    <p className="text-xs text-zinc-500">{j.company}</p>
                  </div>
                  <span className="shrink-0 text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                    {j.tag}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors text-center py-1">
              Ver todas as vagas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
