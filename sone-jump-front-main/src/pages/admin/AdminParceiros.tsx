import { useEffect, useState } from 'react'
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Link,
  Handshake,
  Trash2,
} from 'lucide-react'
import {
  getAdminPartners,
  createPartner,
  updatePartner,
  deletePartner,
  type AdminPartner,
  type IntegrationType,
  type PartnerStatus,
} from '../../services/admin-partners/admin-partners'
import { getJobs, type Job } from '../../services/jobs/jobs'
import { ApiError } from '../../services/api'
import { formatDate } from '../../utils/format'

const AVATAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-cyan-600', 'bg-orange-600', 'bg-rose-600', 'bg-gray-700']
function colorFor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

const TYPE_LABEL: Record<IntegrationType, string> = {
  CONTEUDO: 'Conteúdo', VAGAS: 'Vagas', CERTIFICACAO: 'Certificação', API: 'API', MENTORIA: 'Mentoria',
}
const typeBadge: Record<IntegrationType, string> = {
  CONTEUDO: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  VAGAS: 'bg-green-500/20 text-green-300 border-green-500/30',
  CERTIFICACAO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  API: 'bg-gray-700 text-gray-300 border-gray-600',
  MENTORIA: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}
const STATUS_LABEL: Record<PartnerStatus, string> = { ATIVO: 'Ativo', INATIVO: 'Inativo', PENDENTE: 'Pendente' }
const statusBadge: Record<PartnerStatus, { class: string; icon: React.ComponentType<{ className?: string }> }> = {
  ATIVO: { class: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle },
  INATIVO: { class: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
  PENDENTE: { class: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock },
}

const TYPES: IntegrationType[] = ['CONTEUDO', 'VAGAS', 'CERTIFICACAO', 'API', 'MENTORIA']
const STATUSES: PartnerStatus[] = ['ATIVO', 'INATIVO', 'PENDENTE']

export default function AdminParceiros() {
  const [partners, setPartners] = useState<AdminPartner[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<IntegrationType>('CONTEUDO')
  const [formDesc, setFormDesc] = useState('')
  const [formLogoUrl, setFormLogoUrl] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getAdminPartners(), getJobs()])
      .then(([p, j]) => { setPartners(p); setJobs(j) })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar parceiros.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!formName.trim() || !formDesc.trim()) return
    try {
      const created = await createPartner({
        name: formName.trim(),
        type: formType,
        description: formDesc.trim(),
        logoUrl: formLogoUrl.trim() || undefined,
      })
      setPartners((prev) => [...prev, created])
      setFormName(''); setFormDesc(''); setFormLogoUrl(''); setFormType('CONTEUDO')
      setShowForm(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao criar parceiro.')
    }
  }

  async function handleStatusChange(partner: AdminPartner, status: PartnerStatus) {
    try {
      const updated = await updatePartner(partner.id, { status })
      setPartners((prev) => prev.map((p) => (p.id === partner.id ? updated : p)))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao atualizar parceiro.')
    }
  }

  async function handleDelete(id: number) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete((cur) => (cur === id ? null : cur)), 3000)
      return
    }
    try {
      await deletePartner(id)
      setPartners((prev) => prev.filter((p) => p.id !== id))
      setConfirmDelete(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao excluir parceiro.')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 p-6">Carregando parceiros...</div>

  const jobsByPartner = new Map<number, number>()
  for (const job of jobs) {
    if (job.partner) jobsByPartner.set(job.partner.id, (jobsByPartner.get(job.partner.id) ?? 0) + 1)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciar Parceiros</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie integrações e parcerias estratégicas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Adicionar Parceiro
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total de Parceiros', value: partners.length, color: 'text-blue-400' },
            { label: 'Ativos', value: partners.filter((p) => p.status === 'ATIVO').length, color: 'text-green-400' },
            { label: 'Pendentes', value: partners.filter((p) => p.status === 'PENDENTE').length, color: 'text-yellow-400' },
            { label: 'Vagas Publicadas', value: jobs.length, color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Partner Cards Grid */}
          <div className="lg:col-span-2">
            {partners.length === 0 ? (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-sm text-gray-500">
                Nenhum parceiro cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {partners.map((partner) => {
                  const StatusIcon = statusBadge[partner.status].icon
                  const jobsCount = jobsByPartner.get(partner.id) ?? 0
                  return (
                    <div key={partner.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 hover:border-gray-700 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl ${colorFor(partner.id)} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                            {partner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{partner.name}</p>
                            <p className="text-xs text-gray-500">Desde {partner.since ? formatDate(partner.since) : '—'}</p>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge[partner.status].class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_LABEL[partner.status]}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{partner.description}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeBadge[partner.type]}`}>
                          {TYPE_LABEL[partner.type]}
                        </span>
                        {jobsCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Briefcase className="w-3 h-3" />
                            {jobsCount} vaga{jobsCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {editingId === partner.id ? (
                        <div className="space-y-2">
                          <select
                            value={partner.status}
                            onChange={(e) => handleStatusChange(partner, e.target.value as PartnerStatus)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
                            >
                              Fechar
                            </button>
                            <button
                              onClick={() => handleDelete(partner.id)}
                              className={`flex-1 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 ${confirmDelete === partner.id ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-red-400'}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> {confirmDelete === partner.id ? 'Confirmar?' : 'Excluir'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingId(partner.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
                        >
                          Gerenciar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add Partner Form */}
          {showForm && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 h-fit">
              <div className="flex items-center gap-2 mb-5">
                <Handshake className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Novo Parceiro</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Nome da Empresa</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Udemy"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Tipo de Integração</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as IntegrationType)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">URL do Logo (opcional)</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="url"
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      placeholder="https://"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Descrição</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Descreva a parceria..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!formName.trim() || !formDesc.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Adicionar Parceiro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
