import { useEffect, useState } from 'react'
import { Briefcase, ChevronRight, MapPin, Trash2, Users } from 'lucide-react'
import { ApiError } from '../../services/api'
import {
  deleteAdminJob,
  getAdminJobs,
  getJobApplicants,
  updateApplicationStatus,
  type AdminJob,
  type JobApplicant,
} from '../../services/admin-jobs/admin-jobs'
import type { JobApplicationStatus } from '../../services/jobs/jobs'
import { formatDate } from '../../utils/format'

/** Os quatro estados do funil, na ordem em que acontecem. */
const STATUSES: { id: JobApplicationStatus; label: string; className: string }[] = [
  { id: 'APLICADO', label: 'Aplicado', className: 'bg-zinc-700/40 text-zinc-300 border-zinc-600' },
  { id: 'VISUALIZADO', label: 'Visualizado', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { id: 'ACEITO', label: 'Aceito', className: 'bg-green-500/15 text-green-300 border-green-500/30' },
  { id: 'REJEITADO', label: 'Rejeitado', className: 'bg-red-500/15 text-red-300 border-red-500/30' },
]

const REMOTE_LABEL: Record<string, string> = {
  REMOTO: 'Remoto',
  HIBRIDO: 'Híbrido',
  PRESENCIAL: 'Presencial',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

export default function AdminVagas() {
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null)
  const [applicants, setApplicants] = useState<JobApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [error, setError] = useState('')
  // Dois cliques para excluir: a vaga leva junto todas as candidaturas dela.
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null)

  useEffect(() => {
    getAdminJobs()
      .then(setJobs)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar vagas.'))
      .finally(() => setLoading(false))
  }, [])

  async function openJob(job: AdminJob) {
    setSelectedJob(job)
    setLoadingApplicants(true)
    try {
      setApplicants(await getJobApplicants(job.id))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao carregar candidatos.')
    } finally {
      setLoadingApplicants(false)
    }
  }

  async function changeStatus(application: JobApplicant, status: JobApplicationStatus) {
    // Atualização otimista: o botão responde na hora e volta atrás se o servidor negar.
    const anterior = applicants
    setApplicants((prev) =>
      prev.map((a) => (a.id === application.id ? { ...a, status } : a)),
    )
    try {
      await updateApplicationStatus(application.id, status)
    } catch (e) {
      setApplicants(anterior)
      setError(e instanceof ApiError ? e.message : 'Erro ao atualizar candidatura.')
    }
  }

  async function removeJob(job: AdminJob) {
    if (confirmingDelete !== job.id) {
      setConfirmingDelete(job.id)
      return
    }
    try {
      await deleteAdminJob(job.id)
      setJobs((prev) => prev.filter((j) => j.id !== job.id))
      if (selectedJob?.id === job.id) setSelectedJob(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao excluir vaga.')
    } finally {
      setConfirmingDelete(null)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-gray-400 p-6">Carregando vagas...</div>
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Vagas e Candidaturas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe quem se candidatou e mova cada candidatura pelo funil
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <p className="mb-6 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* Lista de vagas */}
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma vaga cadastrada.</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    selectedJob?.id === job.id
                      ? 'bg-purple-600/10 border-purple-500/40'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <button onClick={() => openJob(job)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{job.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{job.companyName}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span>{REMOTE_LABEL[job.remoteType] ?? job.remoteType}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => removeJob(job)}
                    onBlur={() => setConfirmingDelete(null)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmingDelete === job.id ? 'Confirmar exclusão?' : 'Excluir vaga'}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Candidatos da vaga selecionada */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            {!selectedJob ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Briefcase className="w-8 h-8 text-gray-700 mb-3" />
                <p className="text-sm text-gray-500">
                  Escolha uma vaga para ver quem se candidatou.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">{selectedJob.title}</h2>
                  <span className="text-sm text-gray-500">
                    · {applicants.length} candidato(s)
                  </span>
                </div>

                {loadingApplicants ? (
                  <p className="text-sm text-gray-500">Carregando candidatos...</p>
                ) : applicants.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Ninguém se candidatou a esta vaga ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {applicants.map((application) => (
                      <div
                        key={application.id}
                        className="flex flex-wrap items-center gap-4 border-b border-gray-800/60 pb-3 last:border-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials(application.user.fullName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">
                            {application.user.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {application.user.email} · candidatou-se em{' '}
                            {formatDate(application.appliedAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => changeStatus(application, s.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                application.status === s.id
                                  ? s.className
                                  : 'bg-transparent text-gray-500 border-gray-700 hover:text-white hover:border-gray-600'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
