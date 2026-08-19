import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Play,
  FileText,
  ExternalLink,
  Star,
  X,
} from 'lucide-react'
import {
  getAdminContent,
  createContent,
  updateContent,
  deleteContent,
  type AdminContentItem,
  type ContentType,
  type ContentPlatform,
  type ContentLevel,
  type ContentStatus,
} from '../../services/admin-content/admin-content'
import { ApiError } from '../../services/api'
import { formatDuration } from '../../utils/format'

const TYPE_LABEL: Record<ContentType, string> = { CURSO: 'Curso', VIDEO: 'Vídeo', ARTIGO: 'Artigo', PROJETO: 'Projeto' }
const typeBadge: Record<ContentType, string> = {
  CURSO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  VIDEO: 'bg-red-500/20 text-red-300 border-red-500/30',
  ARTIGO: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PROJETO: 'bg-green-500/20 text-green-300 border-green-500/30',
}
const typeIcon: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  CURSO: FileText, VIDEO: Play, ARTIGO: FileText, PROJETO: ExternalLink,
}
const LEVEL_LABEL: Record<ContentLevel, string> = { INICIANTE: 'Iniciante', INTERMEDIARIO: 'Intermediário', AVANCADO: 'Avançado' }
const STATUS_LABEL: Record<ContentStatus, string> = { PUBLICADO: 'Publicado', RASCUNHO: 'Rascunho', ARQUIVADO: 'Arquivado' }
const statusBadge: Record<ContentStatus, string> = {
  PUBLICADO: 'bg-green-500/20 text-green-300 border-green-500/30',
  RASCUNHO: 'bg-gray-700 text-gray-400 border-gray-600',
  ARQUIVADO: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const TYPES: ContentType[] = ['CURSO', 'VIDEO', 'ARTIGO', 'PROJETO']
const PLATFORMS: ContentPlatform[] = ['ALURA', 'UDEMY', 'YOUTUBE', 'DIO', 'ROCKETSEAT', 'INTERNO', 'GITHUB', 'BLOG']
const LEVELS: ContentLevel[] = ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO']

type FormState = {
  title: string
  platform: ContentPlatform
  type: ContentType
  durationMinutes: string
  level: ContentLevel
  description: string
  url: string
}

const EMPTY_FORM: FormState = {
  title: '', platform: 'INTERNO', type: 'VIDEO', durationMinutes: '', level: 'INICIANTE', description: '', url: '',
}

export default function AdminConteudos() {
  const [contents, setContents] = useState<AdminContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'Todos' | ContentType>('Todos')
  const [platformFilter, setPlatformFilter] = useState<'Todos' | ContentPlatform>('Todos')

  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  useEffect(() => {
    getAdminContent()
      .then(setContents)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar conteúdos.'))
      .finally(() => setLoading(false))
  }, [])

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId('new')
  }

  function openEdit(item: AdminContentItem) {
    setForm({
      title: item.title,
      platform: item.platform,
      type: item.type,
      durationMinutes: String(item.durationMinutes),
      level: item.level,
      description: item.description,
      url: item.url ?? '',
    })
    setEditingId(item.id)
  }

  async function handleSave() {
    const durationMinutes = Number(form.durationMinutes)
    if (!form.title.trim() || !form.description.trim() || !durationMinutes) return
    const input = {
      title: form.title.trim(),
      platform: form.platform,
      type: form.type,
      durationMinutes,
      level: form.level,
      description: form.description.trim(),
      url: form.url.trim() || undefined,
    }
    try {
      if (editingId === 'new') {
        const created = await createContent(input)
        setContents((prev) => [...prev, created])
      } else if (typeof editingId === 'number') {
        const updated = await updateContent(editingId, input)
        setContents((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
      }
      setEditingId(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao salvar conteúdo.')
    }
  }

  async function handleDelete(id: number) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete((cur) => (cur === id ? null : cur)), 3000)
      return
    }
    try {
      await deleteContent(id)
      setContents((prev) => prev.filter((c) => c.id !== id))
      setConfirmDelete(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao excluir conteúdo.')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 p-6">Carregando conteúdos...</div>

  const filtered = contents.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'Todos' || c.type === typeFilter
    const matchPlatform = platformFilter === 'Todos' || c.platform === platformFilter
    return matchSearch && matchType && matchPlatform
  })

  const avgRating = contents.length === 0 ? 0 : contents.reduce((s, c) => s + c.rating, 0) / contents.length

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciar Conteúdos</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie cursos, vídeos, artigos e projetos</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Adicionar Conteúdo
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {error && <p className="text-sm text-red-400">{error}</p>}

        {editingId !== null && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingId === 'new' ? 'Novo Conteúdo' : 'Editar Conteúdo'}</h2>
              <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ContentType })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Plataforma</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as ContentPlatform })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Duração (minutos)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Nível</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value as ContentLevel })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">URL (opcional)</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.description.trim() || !Number(form.durationMinutes)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {editingId === 'new' ? 'Criar Conteúdo' : 'Salvar Alterações'}
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Conteúdos', value: contents.length, color: 'text-blue-400' },
            { label: 'Publicados', value: contents.filter((c) => c.status === 'PUBLICADO').length, color: 'text-green-400' },
            { label: 'Rascunhos', value: contents.filter((c) => c.status === 'RASCUNHO').length, color: 'text-yellow-400' },
            { label: 'Nota Média', value: avgRating.toFixed(1), color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="Todos">Todos os tipos</option>
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as typeof platformFilter)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="Todos">Todas as plataformas</option>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Título</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plataforma</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Duração</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Avaliação</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">Nenhum conteúdo encontrado</td>
                  </tr>
                ) : (
                  filtered.map((item, i) => {
                    const TypeIcon = typeIcon[item.type]
                    return (
                      <tr key={item.id} className={`border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-900/40'}`}>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-200 font-medium max-w-xs truncate">{item.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeBadge[item.type]}`}>
                            {TYPE_LABEL[item.type]}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400">{item.platform}</td>
                        <td className="py-4 px-4 text-center text-sm text-gray-400">{formatDuration(item.durationMinutes)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-300">{item.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[item.status]}`}>
                              {STATUS_LABEL[item.status]}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-yellow-400 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${confirmDelete === item.id ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-500 hover:text-red-400'}`}
                            >
                              {confirmDelete === item.id ? 'Confirmar?' : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 text-sm text-gray-500">
            {filtered.length} conteúdo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
