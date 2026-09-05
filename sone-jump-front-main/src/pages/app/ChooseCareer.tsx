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
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { getCareers, type Career } from "../../services/careers/careers";
import { chooseCareer, getRoadmap } from "../../services/roadmap/roadmap";
import { ApiError } from "../../services/api";

const ICONS: Record<string, React.ReactNode> = {
  monitor: <Monitor size={26} />,
  server: <Server size={26} />,
  chart: <BarChart2 size={26} />,
  "git-branch": <GitBranch size={26} />,
  smartphone: <Smartphone size={26} />,
  palette: <Palette size={26} />,
};

function salaryRange(min: number, max: number): string {
  return `R$ ${min.toLocaleString("pt-BR")} - R$ ${max.toLocaleString("pt-BR")}`;
}

function avgTime(min: number, max: number): string {
  return `${min}-${max} meses`;
}

export default function ChooseCareer() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [currentCareerSlug, setCurrentCareerSlug] = useState<string | null>(null);
  const [currentCareerTitle, setCurrentCareerTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [choosingSlug, setChoosingSlug] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCareers(), getRoadmap()])
      .then(([list, roadmap]) => {
        setCareers(list);
        setCurrentCareerSlug(roadmap.career?.slug ?? null);
        setCurrentCareerTitle(roadmap.career?.title ?? null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar carreiras."))
      .finally(() => setLoading(false));
  }, []);

  // Escolha direta (sem quiz): a pessoa já sabe o que quer, então não faz
  // sentido perguntar o nível de novo — parte do zero ("iniciante") por
  // padrão. Quem quer que o nível conte de verdade usa o quiz.
  async function handleChoose(career: Career) {
    // Já é a carreira ativa: não regenera nada, só volta pro roadmap dela.
    if (career.slug === currentCareerSlug) {
      navigate("/app/roadmap");
      return;
    }

    // Trocar de carreira substitui o roadmap atual (etapas e progresso) —
    // confirma antes pra não perder isso sem querer.
    if (currentCareerSlug) {
      const confirmed = window.confirm(
        `Isso vai substituir seu roadmap atual (${currentCareerTitle}) pelo de ${career.title}, apagando o progresso feito até agora. Quer continuar?`,
      );
      if (!confirmed) return;
    }

    setError("");
    setChoosingSlug(career.slug);
    try {
      await chooseCareer(career.slug, "iniciante");
      navigate("/app/roadmap");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao gerar o roadmap.");
      setChoosingSlug(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Escolha sua carreira</h1>
        <p className="text-zinc-400 text-sm mt-0.5">
          Cada carreira tem seu próprio roadmap. Escolha uma para gerar o seu.
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      {currentCareerTitle && (
        <div className="mb-4 text-sm text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2">
          Você já tem um roadmap em <strong>{currentCareerTitle}</strong>. Escolher outra carreira substitui o
          progresso atual.
        </div>
      )}

      {/* Quiz CTA */}
      <div className="mb-6 bg-gradient-to-br from-purple-900/40 to-zinc-900 border border-purple-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-purple-300" />
          </div>
          <div>
            <p className="font-semibold text-white">Não sabe qual escolher?</p>
            <p className="text-zinc-400 text-sm mt-0.5">
              Responda um quiz rápido de 2 minutos e a gente recomenda uma carreira pra você.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/app/careers/quiz-intro")}
          className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Fazer o quiz
        </button>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Carregando carreiras...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.map((career) => {
            const isCurrent = career.slug === currentCareerSlug;
            return (
              <div
                key={career.id}
                className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col gap-4 transition-colors ${
                  isCurrent ? "border-purple-500/60" : "border-zinc-800 hover:border-purple-500/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    {ICONS[career.iconKey] ?? <Monitor size={26} />}
                  </div>
                  {isCurrent && (
                    <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
                      Carreira atual
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white">{career.title}</h3>
                  <p className="text-zinc-400 text-sm mt-1 leading-relaxed">{career.description}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <TrendingUp size={13} /> Salário
                    </span>
                    <span className="text-green-400 font-semibold">
                      {salaryRange(career.salaryMin, career.salaryMax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Clock size={13} /> Até 1º emprego
                    </span>
                    <span className="text-purple-300 font-medium">
                      {avgTime(career.avgMonthsMin, career.avgMonthsMax)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleChoose(career)}
                  disabled={choosingSlug !== null}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {choosingSlug === career.slug
                    ? "Gerando roadmap..."
                    : isCurrent
                    ? "Continuar este roadmap"
                    : "Escolher esse roadmap"}
                  {choosingSlug !== career.slug && <ArrowRight size={15} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
