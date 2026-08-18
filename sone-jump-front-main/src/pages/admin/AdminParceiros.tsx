import { useState } from 'react'
import {
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  BookOpen,
  Link,
  Handshake,
  Upload,
} from 'lucide-react'

type IntegrationType = 'Conteúdo' | 'Vagas' | 'Certificação' | 'API' | 'Mentoria'
type PartnerStatus = 'Ativo' | 'Inativo' | 'Pendente'

interface Partner {
  id: number
  name: string
  initial: string
  color: string
  type: IntegrationType
  status: PartnerStatus
  contents: number
  since: string
  description: string
}

const partners: Partner[] = [
  {
    id: 1,
    name: 'Alura',
    initial: 'A',
    color: 'bg-blue-600',
    type: 'Conteúdo',
    status: 'Ativo',
    contents: 120,
    since: 'Mar 2023',
    description: 'Plataforma líder em cursos de tecnologia no Brasil',
  },
  {
    id: 2,
    name: 'RocketSeat',
    initial: 'R',
    color: 'bg-purple-600',
    type: 'Conteúdo',
    status: 'Ativo',
    contents: 85,
    since: 'Jun 2023',
    description: 'Especialistas em educação para devs',
  },
  {
    id: 3,
    name: 'Gupy',
    initial: 'G',
    color: 'bg-green-600',
    type: 'Vagas',
    status: 'Ativo',
    contents: 0,
    since: 'Set 2023',
    description: 'Plataforma de recrutamento e seleção tech',
  },
  {
    id: 4,
    name: 'Microsoft',
    initial: 'M',
    color: 'bg-cyan-600',
    type: 'Certificação',
    status: 'Ativo',
    contents: 34,
    since: 'Nov 2023',
    description: 'Certificações oficiais Azure e Microsoft Learn',
  },
  {
    id: 5,
    name: 'AWS',
    initial: 'W',
    color: 'bg-orange-600',
    type: 'Certificação',
    status: 'Pendente',
    contents: 0,
    since: '—',
    description: 'Amazon Web Services — integração em análise',
  },
  {
    id: 6,
    name: 'GitHub',
    initial: 'GH',
    color: 'bg-gray-700',
    type: 'API',
    status: 'Ativo',
    contents: 0,
    since: 'Jan 2024',
    description: 'Integração de repositórios e projetos práticos',
  },
  {
    id: 7,
    name: 'Impulso',
    initial: 'I',
    color: 'bg-rose-600',
    type: 'Mentoria',
    status: 'Inativo',
    contents: 12,
    since: 'Fev 2024',
    description: 'Comunidade de mentoria para devs',
  },
]

const statusBadge: Record<PartnerStatus, { class: string; icon: React.ComponentType<{ className?: string }> }> = {
  Ativo: { class: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle },
  Inativo: { class: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
  Pendente: { class: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: CheckCircle },
}

const typeBadge: Record<IntegrationType, string> = {
  Conteúdo: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Vagas: 'bg-green-500/20 text-green-300 border-green-500/30',
  Certificação: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  API: 'bg-gray-700 text-gray-300 border-gray-600',
  Mentoria: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

export default function AdminParceiros() {
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<IntegrationType>('Conteúdo')
  const [formDesc, setFormDesc] = useState('')

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
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total de Parceiros', value: partners.length, color: 'text-blue-400' },
            { label: 'Ativos', value: partners.filter((p) => p.status === 'Ativo').length, color: 'text-green-400' },
            { label: 'Pendentes', value: partners.filter((p) => p.status === 'Pendente').length, color: 'text-yellow-400' },
            { label: 'Conteúdos Integrados', value: partners.reduce((s, p) => s + p.contents, 0), color: 'text-purple-400' },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {partners.map((partner) => {
                const StatusIcon = statusBadge[partner.status].icon
                return (
                  <div
                    key={partner.id}
                    className="bg-gray-900 rounded-2xl border border-gray-800 p-5 hover:border-gray-700 transition-colors"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${partner.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
                        >
                          {partner.initial}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{partner.name}</p>
                          <p className="text-xs text-gray-500">Desde {partner.since}</p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge[partner.status].class}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {partner.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{partner.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeBadge[partner.type]}`}>
                        {partner.type}
                      </span>
                      {partner.contents > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <BookOpen className="w-3 h-3" />
                          {partner.contents} conteúdos
                        </span>
                      )}
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
                      <Settings className="w-3.5 h-3.5" /> Gerenciar
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Partner Form */}
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
                  <option>Conteúdo</option>
                  <option>Vagas</option>
                  <option>Certificação</option>
                  <option>API</option>
                  <option>Mentoria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">URL do Site</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="url"
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

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Logo (opcional)</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-gray-600 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Clique para fazer upload</p>
                </div>
              </div>

              <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Adicionar Parceiro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
