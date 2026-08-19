import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  Server,
  BarChart2,
  GitBranch,
  Smartphone,
  Palette,
  ArrowRight,
  Zap,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getCareers, type Career, type DemandLevel } from "../services/careers/careers";
import { ApiError } from "../services/api";

const ICONS: Record<string, React.ReactNode> = {
  monitor: <Monitor size={32} />,
  server: <Server size={32} />,
  chart: <BarChart2 size={32} />,
  "git-branch": <GitBranch size={32} />,
  smartphone: <Smartphone size={32} />,
  palette: <Palette size={32} />,
};

const GRADIENTS: Record<string, string> = {
  monitor: "from-purple-600 to-blue-600",
  server: "from-green-600 to-teal-600",
  chart: "from-amber-500 to-orange-600",
  "git-branch": "from-red-600 to-pink-600",
  smartphone: "from-cyan-500 to-blue-500",
  palette: "from-violet-600 to-purple-600",
};

const DEMAND_LABEL: Record<DemandLevel, string> = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta" };
const DEMAND_COLOR: Record<DemandLevel, string> = {
  BAIXA: "text-red-400",
  MEDIA: "text-yellow-400",
  ALTA: "text-green-400",
};

function salaryRange(min: number, max: number): string {
  return `R$ ${min.toLocaleString("pt-BR")} - R$ ${max.toLocaleString("pt-BR")}`;
}

function avgTime(min: number, max: number): string {
  return `${min}-${max} meses`;
}

export default function Explore() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCareers()
      .then(setCareers)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar carreiras."))
      .finally(() => setLoading(false));
  }, []);

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
            {careers.length > 0 ? `${careers.length} carreiras` : "Carreiras"} com alta demanda no mercado brasileiro
          </p>
        </div>

        {error && <p className="text-center text-sm text-red-400 mb-8">{error}</p>}
        {loading ? (
          <p className="text-center text-zinc-500">Carregando carreiras...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
              <div
                key={career.id}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Icon area */}
                <div
                  className={`h-32 bg-gradient-to-br ${GRADIENTS[career.iconKey] ?? "from-purple-600 to-blue-600"} flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity`}
                >
                  <div className="text-white">{ICONS[career.iconKey] ?? <Monitor size={32} />}</div>
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
                      <span className="text-green-400 font-semibold">{salaryRange(career.salaryMin, career.salaryMax)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Clock size={13} /> Até 1º emprego
                      </span>
                      <span className="text-purple-300 font-medium">{avgTime(career.avgMonthsMin, career.avgMonthsMax)}</span>
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
        )}
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
      {careers.length > 0 && (
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-3">Compare carreiras</h2>
            <p className="text-zinc-400 text-lg">
              Veja as principais métricas lado a lado para tomar sua decisão
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              {/* Header row */}
              <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: `160px repeat(${careers.length}, 1fr)` }}>
                <div />
                {careers.map((c) => (
                  <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                    <span className="font-bold text-white text-sm">{c.title}</span>
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {[
                { label: "Salário Inicial", icon: <TrendingUp size={14} />, render: (c: Career) => ({ text: `R$ ${c.salaryMin.toLocaleString("pt-BR")}`, color: "text-white" }) },
                { label: "Demanda de Vagas", icon: <Users size={14} />, render: (c: Career) => ({ text: DEMAND_LABEL[c.jobsDemandLevel], color: DEMAND_COLOR[c.jobsDemandLevel] }) },
                { label: "Dificuldade", icon: <Zap size={14} />, render: (c: Career) => ({ text: DEMAND_LABEL[c.difficultyLevel], color: DEMAND_COLOR[c.difficultyLevel] }) },
                { label: "Tempo Médio", icon: <Clock size={14} />, render: (c: Career) => ({ text: avgTime(c.avgMonthsMin, c.avgMonthsMax), color: "text-white" }) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid gap-3 mb-3"
                  style={{ gridTemplateColumns: `160px repeat(${careers.length}, 1fr)` }}
                >
                  <div className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400">{row.icon}</span>
                    <span className="text-zinc-300 text-sm font-medium">{row.label}</span>
                  </div>
                  {careers.map((c) => {
                    const { text, color } = row.render(c);
                    return (
                      <div key={c.id} className="flex items-center justify-center px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <span className={`text-sm font-semibold ${color}`}>{text}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
