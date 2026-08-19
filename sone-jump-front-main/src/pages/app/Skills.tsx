import { useEffect, useState } from "react";
import {
  Lock,
  CheckCircle,
  CheckCheck,
  GitBranch as Github,
  ExternalLink,
  Plus,
  Clock,
  Zap,
  Tag,
  Trash2,
  Award,
} from "lucide-react";
import {
  getChallenges,
  completeChallenge,
  getPortfolio,
  createPortfolioProject,
  deletePortfolioProject,
  getCertifications,
  getEmployabilityScore,
  type Challenge,
  type PortfolioProject,
  type Certification,
  type EmployabilityScore,
} from "../../services/skills/skills";
import { ApiError } from "../../services/api";
import { formatDate } from "../../utils/format";

type Tab = "desafios" | "projetos" | "certificacoes";
type Filter = "todos" | "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";

const difficultyConfig: Record<Challenge["difficulty"], { label: string; color: string; bg: string }> = {
  INICIANTE: { label: "Iniciante", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  INTERMEDIARIO: { label: "Intermediário", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  AVANCADO: { label: "Avançado", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

/** Score bands — the backend only gives a raw 0-100 score, no category/ranking (no
 * leaderboard exists yet). This is a purely client-side label, not backend truth. */
function scoreBand(score: number): { label: string; next: number | null } {
  if (score >= 90) return { label: "Elite", next: null };
  if (score >= 70) return { label: "Avançado", next: 90 - score };
  if (score >= 40) return { label: "Emergente", next: 70 - score };
  return { label: "Iniciante", next: 40 - score };
}

export default function Skills() {
  const [activeTab, setActiveTab] = useState<Tab>("desafios");
  const [filter, setFilter] = useState<Filter>("todos");

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [score, setScore] = useState<EmployabilityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectStack, setProjectStack] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectDemo, setProjectDemo] = useState("");
  const [savingProject, setSavingProject] = useState(false);

  useEffect(() => {
    Promise.all([getChallenges(), getPortfolio(), getCertifications(), getEmployabilityScore()])
      .then(([ch, pf, certs, sc]) => {
        setChallenges(ch);
        setPortfolio(pf);
        setCertifications(certs);
        setScore(sc);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar skills."))
      .finally(() => setLoading(false));
  }, []);

  const filteredChallenges = filter === "todos" ? challenges : challenges.filter((c) => c.difficulty === filter);

  async function handleCompleteChallenge(id: number) {
    setActionError("");
    try {
      await completeChallenge(id);
      setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, completed: true } : c)));
      const sc = await getEmployabilityScore();
      setScore(sc);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Erro ao concluir desafio.");
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    setActionError("");
    setSavingProject(true);
    try {
      const created = await createPortfolioProject({
        title: projectTitle,
        stackTags: projectStack.split(",").map((s) => s.trim()).filter(Boolean),
        githubUrl: projectGithub || undefined,
        demoUrl: projectDemo || undefined,
      });
      setPortfolio((prev) => [created, ...prev]);
      setProjectTitle("");
      setProjectStack("");
      setProjectGithub("");
      setProjectDemo("");
      setShowProjectForm(false);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Erro ao adicionar projeto.");
    } finally {
      setSavingProject(false);
    }
  }

  async function handleDeleteProject(id: number) {
    setActionError("");
    try {
      await deletePortfolioProject(id);
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Erro ao remover projeto.");
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando skills...</div>;
  if (error) return <div className="min-h-screen bg-[#050505] text-red-400 p-6">{error}</div>;
  if (!score) return null;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.score / 100) * circumference;
  const band = scoreBand(score.score);

  const tabs: { id: Tab; label: string }[] = [
    { id: "desafios", label: "Desafios" },
    { id: "projetos", label: "Projetos" },
    { id: "certificacoes", label: "Certificações" },
  ];

  const filters: { id: Filter; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "INICIANTE", label: "Iniciante" },
    { id: "INTERMEDIARIO", label: "Intermediário" },
    { id: "AVANCADO", label: "Avançado" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Validação de Habilidades</h1>
        <p className="text-zinc-400 text-sm mt-1">Prove suas skills e conquiste oportunidades reais</p>
      </div>

      {actionError && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {actionError}
        </div>
      )}

      {/* Employability Score Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative flex items-center justify-center w-48 h-48 shrink-0">
          <svg width="192" height="192" viewBox="0 0 192 192">
            <circle cx="96" cy="96" r={radius} fill="none" stroke="#27272a" strokeWidth="14" />
            <circle
              cx="96"
              cy="96"
              r={radius}
              fill="none"
              stroke="#a855f7"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 96 96)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white">{score.score}</span>
            <span className="text-xs text-zinc-400">de 100</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Score de Empregabilidade</h2>
          <p className="text-zinc-400 mb-4">
            {band.next !== null ? `Continue evoluindo — faltam ${band.next} pts para o próximo nível` : "Nível máximo alcançado!"}
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-zinc-800 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-zinc-500">Categoria</p>
              <p className="text-sm font-semibold text-yellow-400">{band.label}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-zinc-500">Certificações</p>
              <p className="text-sm font-semibold text-green-400">{score.certifications}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-zinc-500">Desafios</p>
              <p className="text-sm font-semibold text-purple-400">{score.challengesCompleted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* DESAFIOS TAB */}
          {activeTab === "desafios" && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      filter === f.id ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((ch) => {
                  const dc = difficultyConfig[ch.difficulty];
                  return (
                    <div
                      key={ch.id}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-3 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white leading-tight">{ch.title}</h3>
                        <span className={`shrink-0 text-xs border px-2 py-0.5 rounded-full ${dc.color} ${dc.bg}`}>
                          {dc.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{ch.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ch.tags.map((t) => (
                          <span key={t} className="flex items-center gap-1 text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                            <Tag className="w-2.5 h-2.5" />
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {ch.timeLabel}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400 font-medium">
                          <Zap className="w-3.5 h-3.5" />+{ch.xpReward} XP
                        </span>
                      </div>
                      <button
                        disabled={ch.completed}
                        onClick={() => handleCompleteChallenge(ch.id)}
                        className={`mt-auto w-full text-sm font-medium py-2 rounded-lg transition-colors ${
                          ch.completed
                            ? "bg-green-600/20 text-green-400 border border-green-500/30 cursor-default"
                            : "bg-purple-600 hover:bg-purple-500 text-white"
                        }`}
                      >
                        {ch.completed ? "Concluído" : "Concluir Desafio"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROJETOS TAB */}
          {activeTab === "projetos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Seus projetos públicos no portfolio</p>
                <button
                  onClick={() => setShowProjectForm((v) => !v)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Projeto
                </button>
              </div>

              {showProjectForm && (
                <form onSubmit={handleCreateProject} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-3">
                  <input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Nome do projeto"
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    value={projectStack}
                    onChange={(e) => setProjectStack(e.target.value)}
                    placeholder="Stack (separado por vírgula: React, Tailwind)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-3">
                    <input
                      value={projectGithub}
                      onChange={(e) => setProjectGithub(e.target.value)}
                      placeholder="Link do GitHub (opcional)"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      value={projectDemo}
                      onChange={(e) => setProjectDemo(e.target.value)}
                      placeholder="Link do demo (opcional)"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingProject}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingProject ? "Salvando..." : "Salvar Projeto"}
                  </button>
                </form>
              )}

              {portfolio.length === 0 ? (
                <p className="text-zinc-500 text-sm">Nenhum projeto adicionado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolio.map((p) => (
                    <div
                      key={p.id}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors group relative"
                    >
                      <div className="h-28 bg-gradient-to-br from-purple-600 to-blue-600 opacity-80" />
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {p.stackTags.map((t) => (
                            <span key={t} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                              <Github className="w-3.5 h-3.5" />GitHub
                            </a>
                          )}
                          {p.demoUrl && (
                            <a href={p.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CERTIFICAÇÕES TAB */}
          {activeTab === "certificacoes" && (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    cert.earned ? "bg-zinc-800 border-zinc-700" : "bg-zinc-800/50 border-zinc-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cert.earned ? (
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-500 shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${cert.earned ? "text-white" : "text-zinc-500"}`}>{cert.name}</p>
                      {cert.earned && cert.earnedAt && (
                        <p className="text-xs text-zinc-500">Conquistado em {formatDate(cert.earnedAt)}</p>
                      )}
                    </div>
                  </div>
                  {cert.earned ? (
                    <span className="text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-3 py-1 rounded-full">
                      Conquistado
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500 border border-zinc-700 px-3 py-1 rounded-full">
                      Ainda não conquistado
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market Ready Banner — conditions are computed from real score data below,
          not hardcoded like the original mock. */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-purple-900/60 border border-purple-500/30 rounded-xl p-6">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl shrink-0">
            <Award className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Selo Pronto para o Mercado</h3>
            <p className="text-sm text-zinc-400 mb-4">Complete os requisitos abaixo para desbloquear seu selo oficial</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "Completar 3 certificações", done: score.certifications >= 3 },
                { label: "Finalizar 5 desafios práticos", done: score.challengesCompleted >= 5 },
                { label: "Ter score ≥ 80", done: score.score >= 80 },
                { label: "Adicionar 2 projetos ao portfolio", done: score.portfolioProjects >= 2 },
              ].map((cond) => (
                <div key={cond.label} className="flex items-center gap-2 text-sm">
                  <CheckCheck className={`w-4 h-4 shrink-0 ${cond.done ? "text-green-400" : "text-zinc-600"}`} />
                  <span className={cond.done ? "text-zinc-300" : "text-zinc-500"}>{cond.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
