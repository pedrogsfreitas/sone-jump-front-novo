import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { getJobs, applyToJob, getMyApplications, type Job } from "../../services/jobs/jobs";
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

export default function Market() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<{ name: string; pct: number }[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getJobs(), getSkillProgress(), getMyApplications()])
      .then(([j, sk, apps]) => {
        setJobs(j);
        setSkills(sk);
        setAppliedJobIds(new Set(apps.map((a) => a.jobId)));
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar mercado."))
      .finally(() => setLoading(false));
  }, []);

  async function handleApply(jobId: number) {
    setApplying(jobId);
    try {
      await applyToJob(jobId);
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao se candidatar.");
    } finally {
      setApplying(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando mercado...</div>;

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
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-400" />
          Vagas Compatíveis
        </h2>
        {jobs.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center text-sm text-zinc-500">
            Nenhuma vaga disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const applied = appliedJobIds.has(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${jobColor(job.id)} flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {job.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{job.title}</p>
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
                    {job.location} · {job.remoteType === "REMOTO" ? "Remoto" : job.remoteType === "HIBRIDO" ? "Híbrido" : "Presencial"}
                  </div>

                  <p className="text-zinc-300 text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>

                  <div className="flex flex-wrap gap-1">
                    {job.skills.map((s) => (
                      <span key={s} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applied || applying === job.id}
                    className="mt-1 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-semibold transition-colors"
                  >
                    {applied ? "Candidatura Enviada" : applying === job.id ? "Enviando..." : "Candidatar-se"}
                  </button>
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
              <h3 className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Skills a Desenvolver
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length === 0 && <p className="text-xs text-zinc-500">Todas as suas skills estão acima de 50%.</p>}
                {missingSkills.map((s) => (
                  <span key={s} className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
