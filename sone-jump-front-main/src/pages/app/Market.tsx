import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Target, Briefcase, X } from "lucide-react";
import {
  getJobs,
  applyToJob,
  getMyApplications,
  type Job,
  type JobApplicationStatus,
  type RemoteType,
} from "../../services/jobs/jobs";
import { getSkillProgress } from "../../services/skills/skills";
import { ApiError } from "../../services/api";

const JOB_COLORS = ["bg-purple-600", "bg-orange-500", "bg-green-600", "bg-yellow-500", "bg-blue-600", "bg-pink-600"];

function jobColor(id: number): string {
  return JOB_COLORS[id % JOB_COLORS.length];
}

function matchColor(match: number) {
  if (match >= 85) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (match >= 75) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-orange-500/20 text-orange-400 border-orange-500/30";
}

function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return "A combinar";
  if (min !== null && max !== null) return `R$ ${min.toLocaleString("pt-BR")} – R$ ${max.toLocaleString("pt-BR")}`;
  const value = min ?? max;
  return `R$ ${value!.toLocaleString("pt-BR")}`;
}

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const REMOTE_TYPE_LABEL: Record<RemoteType, string> = {
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
  PRESENCIAL: "Presencial",
};

/** Rótulo e cor de cada estado do funil de candidatura. */
const APPLICATION_STATUS: Record<JobApplicationStatus, { label: string; className: string }> = {
  APLICADO: { label: "Candidatura Enviada", className: "bg-zinc-800 text-zinc-400" },
  VISUALIZADO: { label: "Currículo Visualizado", className: "bg-blue-500/15 text-blue-300" },
  ACEITO: { label: "Candidatura Aceita", className: "bg-green-500/15 text-green-300" },
  REJEITADO: { label: "Não Selecionado", className: "bg-red-500/15 text-red-300" },
};

export default function Market() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<{ name: string; pct: number }[]>([]);
  // Guarda o status, não só "se candidatou": o funil (Visualizado → Aceito/Rejeitado)
  // agora é movido pelo admin, e a tela precisa refletir onde a candidatura está.
  const [statusByJobId, setStatusByJobId] = useState<Map<number, JobApplicationStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState<number | null>(null);
  const [remoteFilter, setRemoteFilter] = useState<RemoteType | "TODAS">("TODAS");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    Promise.all([getJobs(), getSkillProgress(), getMyApplications()])
      .then(([j, sk, apps]) => {
        setJobs(j);
        setSkills(sk);
        setStatusByJobId(new Map(apps.map((a) => [a.jobId, a.status])));
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar mercado."))
      .finally(() => setLoading(false));
  }, []);

  async function handleApply(jobId: number) {
    setApplying(jobId);
    try {
      await applyToJob(jobId);
      setStatusByJobId((prev) => new Map(prev).set(jobId, "APLICADO"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao se candidatar.");
    } finally {
      setApplying(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando mercado...</div>;

  const displayedJobs = remoteFilter === "TODAS" ? jobs : jobs.filter((j) => j.remoteType === remoteFilter);

  const mySkills = skills.filter((s) => s.pct >= 50).map((s) => s.name);
  const missingSkills = skills.filter((s) => s.pct < 50).map((s) => s.name);

  const matches = jobs.map((j) => j.match).filter((m): m is number => m !== null);
  const avgMatch = matches.length > 0 ? Math.round(matches.reduce((a, b) => a + b, 0) / matches.length) : 0;
  const compatibleCount = matches.filter((m) => m >= 60).length;

  return (
    <div className="min-h-screen bg-[#050505] p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inteligência de Mercado</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Vagas reais compatíveis com o seu perfil de skills.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Hero: Compatibilidade com o Mercado */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex flex-col items-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={RING_RADIUS} fill="none" stroke="#27272a" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={RING_RADIUS}
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - avgMatch / 100)}
              transform="rotate(-90 70 70)"
            />
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <text x="70" y="65" textAnchor="middle" style={{ fill: "white", fontSize: "22px", fontWeight: "700" }}>
              {avgMatch}%
            </text>
            <text x="70" y="84" textAnchor="middle" style={{ fill: "#a1a1aa", fontSize: "10px" }}>
              compatível
            </text>
          </svg>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-white mb-1">Compatibilidade com o Mercado</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Seu perfil está pronto para{" "}
            <span className="text-purple-400 font-semibold">{compatibleCount} vagas</span> abertas agora.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="bg-zinc-800 rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-lg">{jobs.length}</p>
              <p className="text-zinc-400 text-xs">Vagas no catálogo</p>
            </div>
            <div className="bg-zinc-800 rounded-xl px-4 py-2 text-center">
              <p className="text-white font-bold text-lg">{compatibleCount}</p>
              <p className="text-zinc-400 text-xs">Vagas compatíveis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vagas Compatíveis */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Vagas Compatíveis
          </h2>
          <div className="flex gap-2">
            {(["TODAS", "REMOTO", "HIBRIDO", "PRESENCIAL"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setRemoteFilter(opt)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  remoteFilter === opt
                    ? "bg-purple-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {opt === "TODAS" ? "Todas" : REMOTE_TYPE_LABEL[opt]}
              </button>
            ))}
          </div>
        </div>
        {displayedJobs.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center text-sm text-zinc-500">
            {jobs.length === 0 ? "Nenhuma vaga disponível no momento." : "Nenhuma vaga com esse filtro."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedJobs.map((job) => {
              const applicationStatus = statusByJobId.get(job.id);
              const applied = applicationStatus !== undefined;
              return (
                <div
                  key={job.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {job.companyLogoUrl ? (
                        <img
                          src={job.companyLogoUrl}
                          alt={job.companyName}
                          className="w-10 h-10 rounded-xl object-cover bg-zinc-800 shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl ${jobColor(job.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                        >
                          {job.companyName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-white font-semibold text-sm text-left hover:text-purple-300 transition-colors"
                        >
                          {job.title}
                        </button>
                        <p className="text-zinc-400 text-xs">{job.companyName}</p>
                      </div>
                    </div>
                    {job.match !== null && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${matchColor(job.match)}`}>
                        {job.match}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-zinc-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    {job.location} · {REMOTE_TYPE_LABEL[job.remoteType]}
                  </div>

                  <p className="text-zinc-300 text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>

                  <div className="flex flex-wrap gap-1">
                    {job.skills.map((s) => (
                      <span key={s} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-2 rounded-xl text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                    >
                      Ver detalhes
                    </button>
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applied || applying === job.id}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        applicationStatus
                          ? APPLICATION_STATUS[applicationStatus].className
                          : "bg-purple-600 hover:bg-purple-500 text-white"
                      } disabled:cursor-default`}
                    >
                      {applicationStatus
                        ? APPLICATION_STATUS[applicationStatus].label
                        : applying === job.id
                          ? "Enviando..."
                          : "Candidatar-se"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Análise de Gap de Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Análise de Gap de Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Suas Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {mySkills.length === 0 && <p className="text-xs text-zinc-500">Nenhuma skill acima de 50% ainda.</p>}
                {mySkills.map((s) => (
                  <span key={s} className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Skills a Desenvolver
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length === 0 && <p className="text-xs text-zinc-500">Todas as suas skills estão acima de 50%.</p>}
                {missingSkills.map((s) => (
                  <span key={s} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhe da vaga */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {selectedJob.companyLogoUrl ? (
                  <img
                    src={selectedJob.companyLogoUrl}
                    alt={selectedJob.companyName}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-800 shrink-0"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-xl ${jobColor(selectedJob.id)} flex items-center justify-center text-white font-bold shrink-0`}
                  >
                    {selectedJob.companyName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedJob.title}</h3>
                  <p className="text-zinc-400 text-sm">{selectedJob.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="shrink-0 p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={15} className="text-zinc-400" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {selectedJob.location} · {REMOTE_TYPE_LABEL[selectedJob.remoteType]}
              </span>
              <span>·</span>
              <span>{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
              {selectedJob.match !== null && (
                <>
                  <span>·</span>
                  <span className={`px-2 py-0.5 rounded-lg border ${matchColor(selectedJob.match)}`}>
                    {selectedJob.match}% compatível
                  </span>
                </>
              )}
            </div>

            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line mb-4">
              {selectedJob.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-5">
              {selectedJob.skills.map((s) => (
                <span key={s} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700">
                  {s}
                </span>
              ))}
            </div>

            {selectedJob.partner && (
              <p className="text-xs text-zinc-500 mb-5">Vaga divulgada em parceria com {selectedJob.partner.name}.</p>
            )}

            {(() => {
              const applicationStatus = statusByJobId.get(selectedJob.id);
              const applied = applicationStatus !== undefined;
              return (
                <button
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applied || applying === selectedJob.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    applicationStatus
                      ? APPLICATION_STATUS[applicationStatus].className
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  } disabled:cursor-default`}
                >
                  {applicationStatus
                    ? APPLICATION_STATUS[applicationStatus].label
                    : applying === selectedJob.id
                      ? "Enviando..."
                      : "Candidatar-se"}
                </button>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
