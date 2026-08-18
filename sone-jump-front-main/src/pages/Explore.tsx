import { useNavigate } from "react-router-dom";
import {
  Monitor,
  Server,
  BarChart2,
  GitBranch,
  Smartphone,
  Layers,
  ArrowRight,
  Zap,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

interface Career {
  id: string;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  salaryRange: string;
  avgTime: string;
  description: string;
}

const careers: Career[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    icon: <Monitor size={32} />,
    gradient: "from-purple-600 to-blue-600",
    salaryRange: "R$ 4.000 - R$ 18.000",
    avgTime: "8-12 meses",
    description: "Crie interfaces modernas e interativas para web.",
  },
  {
    id: "backend",
    title: "Backend Developer",
    icon: <Server size={32} />,
    gradient: "from-green-600 to-teal-600",
    salaryRange: "R$ 5.000 - R$ 22.000",
    avgTime: "10-14 meses",
    description: "Desenvolva APIs e sistemas robustos no servidor.",
  },
  {
    id: "data-science",
    title: "Data Scientist",
    icon: <BarChart2 size={32} />,
    gradient: "from-amber-500 to-orange-600",
    salaryRange: "R$ 6.000 - R$ 25.000",
    avgTime: "12-18 meses",
    description: "Extraia insights e construa modelos preditivos.",
  },
  {
    id: "devops",
    title: "DevOps Engineer",
    icon: <GitBranch size={32} />,
    gradient: "from-red-600 to-pink-600",
    salaryRange: "R$ 7.000 - R$ 28.000",
    avgTime: "14-20 meses",
    description: "Automatize pipelines e gerencie infraestrutura.",
  },
  {
    id: "mobile",
    title: "Mobile Developer",
    icon: <Smartphone size={32} />,
    gradient: "from-cyan-500 to-blue-500",
    salaryRange: "R$ 4.500 - R$ 20.000",
    avgTime: "10-16 meses",
    description: "Crie apps nativos e híbridos para iOS e Android.",
  },
  {
    id: "ux-ui",
    title: "UX/UI Designer",
    icon: <Layers size={32} />,
    gradient: "from-violet-600 to-purple-600",
    salaryRange: "R$ 3.500 - R$ 16.000",
    avgTime: "6-10 meses",
    description: "Projete experiências digitais intuitivas e bonitas.",
  },
];

const comparisonData = [
  {
    career: "Frontend Dev",
    salarioInicial: "R$ 4.000",
    vagas: "Alta",
    dificuldade: "Média",
    tempo: "8-12 meses",
    vagaColor: "text-green-400",
    difColor: "text-yellow-400",
  },
  {
    career: "Data Scientist",
    salarioInicial: "R$ 6.000",
    vagas: "Média",
    dificuldade: "Alta",
    tempo: "12-18 meses",
    vagaColor: "text-yellow-400",
    difColor: "text-red-400",
  },
  {
    career: "DevOps Eng.",
    salarioInicial: "R$ 7.000",
    vagas: "Alta",
    dificuldade: "Alta",
    tempo: "14-20 meses",
    vagaColor: "text-green-400",
    difColor: "text-red-400",
  },
];

const comparisonRows = [
  { label: "Salário Inicial", icon: <TrendingUp size={14} />, key: "salarioInicial" },
  { label: "Vagas Disponíveis", icon: <Users size={14} />, key: "vagas" },
  { label: "Dificuldade", icon: <Zap size={14} />, key: "dificuldade" },
  { label: "Tempo Médio", icon: <Clock size={14} />, key: "tempo" },
];

export default function Explore() {
  const navigate = useNavigate();

  function scrollToRoadmaps() {
    document.getElementById("careers")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-700/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
            <Zap size={14} />
            Plataforma #1 de carreiras em tech no Brasil
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Explore Carreiras{" "}
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              em Tech
            </span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Descubra qual carreira combina com você, veja salários reais, tempo de aprendizado e comece hoje com um roadmap personalizado.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-lg hover:from-purple-500 hover:to-purple-400 transition-all duration-200 shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95"
            >
              Começar Grátis
            </button>
            <button
              onClick={scrollToRoadmaps}
              className="px-8 py-4 rounded-2xl border border-zinc-700 text-zinc-300 font-bold text-lg hover:border-purple-500 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Ver Roadmaps
            </button>
          </div>
        </div>
      </section>

      {/* Career Grid */}
      <section id="careers" className="px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-white mb-3">Escolha sua trilha</h2>
          <p className="text-zinc-400 text-lg">
            6 carreiras com alta demanda no mercado brasileiro
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((career) => (
            <div
              key={career.id}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Icon area */}
              <div
                className={`h-32 bg-gradient-to-br ${career.gradient} flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity`}
              >
                <div className="text-white">{career.icon}</div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{career.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{career.description}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <TrendingUp size={13} /> Salário
                    </span>
                    <span className="text-green-400 font-semibold">{career.salaryRange}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Clock size={13} /> Até 1º emprego
                    </span>
                    <span className="text-purple-300 font-medium">{career.avgTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/onboarding")}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-semibold hover:border-purple-500 hover:text-white hover:bg-purple-500/10 transition-all duration-200"
                >
                  Ver Roadmap
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/60 to-zinc-900 border border-purple-500/30 p-10 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-800/20 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-5xl mb-4">🤔</div>
            <h2 className="text-3xl font-black text-white mb-3">
              Não sabe por onde começar?
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
              Responda 5 perguntas rápidas e descubra qual carreira em tech é ideal para o seu perfil.
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40"
            >
              <Zap size={20} />
              Fazer Quiz Gratuito
            </button>
          </div>
        </div>
      </section>

      {/* Career Comparison Table */}
      <section className="px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-white mb-3">Compare carreiras</h2>
          <p className="text-zinc-400 text-lg">
            Veja as principais métricas lado a lado para tomar sua decisão
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="col-span-1" />
              {comparisonData.map((col) => (
                <div
                  key={col.career}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center"
                >
                  <span className="font-bold text-white text-sm">{col.career}</span>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {comparisonRows.map((row, ri) => (
              <div
                key={row.key}
                className={`grid grid-cols-4 gap-3 mb-3 ${
                  ri % 2 === 0 ? "" : ""
                }`}
              >
                <div className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">{row.icon}</span>
                  <span className="text-zinc-300 text-sm font-medium">{row.label}</span>
                </div>
                {comparisonData.map((col) => {
                  const value = col[row.key as keyof typeof col] as string;
                  const colorClass =
                    row.key === "vagas"
                      ? col.vagaColor
                      : row.key === "dificuldade"
                      ? col.difColor
                      : "text-white";
                  return (
                    <div
                      key={col.career}
                      className="flex items-center justify-center px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800"
                    >
                      <span className={`text-sm font-semibold ${colorClass}`}>{value}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
