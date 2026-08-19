import { useEffect, useState } from 'react'
import {
  Plus,
  BookOpen,
  Layers,
  Users,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Trash2,
  X,
} from 'lucide-react'
import {
  getTrails,
  createTrail,
  updateTrail,
  deleteTrail,
  addTrailModule,
  removeTrailModule,
  type Trail,
} from '../../services/admin-trails/admin-trails'
import { ApiError } from '../../services/api'
import { formatDuration } from '../../utils/format'

const CATEGORY_COLOR: Record<string, string> = {
  Frontend: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Backend: 'bg-green-500/20 text-green-300 border-green-500/30',
  'Full Stack': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  DevOps: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Data: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
}
function categoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? 'bg-gray-700 text-gray-300 border-gray-600'
}

export default function AdminTrilhas() {
  const [trails, setTrails] = useState<Trail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const [moduleForm, setModuleForm] = useState<number | null>(null)
  const [modTitle, setModTitle] = useState('')
  const [modDuration, setModDuration] = useState('')
  const [modLessons, setModLessons] = useState('')

  useEffect(() => {
    getTrails()
      .then(setTrails)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar trilhas.'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleActive(trail: Trail) {
    try {
      const updated = await updateTrail(trail.id, { active: !trail.active })
      setTrails((prev) => prev.map((t) => (t.id === trail.id ? { ...t, active: updated.active } : t)))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao atualizar trilha.')
    }
  }

  async function handleCreateTrail() {
    if (!newName.trim() || !newCategory.trim()) return
    try {
      const created = await createTrail({ name: newName.trim(), category: newCategory.trim() })
      setTrails((prev) => [...prev, { ...created, modules: [], enrolled: 0, completion: 0 }])
      setNewName('')
      setNewCategory('')
      setShowNewForm(false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao criar trilha.')
    }
  }

  async function handleDelete(id: number) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete((cur) => (cur === id ? null : cur)), 3000)
      return
    }
    try {
      await deleteTrail(id)
      setTrails((prev) => prev.filter((t) => t.id !== id))
      setConfirmDelete(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao excluir trilha.')
    }
  }

  async function handleAddModule(trailId: number) {
    const durationMinutes = Number(modDuration)
    const lessons = Number(modLessons)
    if (!modTitle.trim() || !durationMinutes || !lessons) return
    try {
      const created = await addTrailModule(trailId, { title: modTitle.trim(), durationMinutes, lessons })
      setTrails((prev) =>
        prev.map((t) => (t.id === trailId ? { ...t, modules: [...t.modules, created] } : t)),
      )
      setModTitle('')
      setModDuration('')
      setModLessons('')
      setModuleForm(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao adicionar módulo.')
    }
  }

  async function handleRemoveModule(trailId: number, moduleId: number) {
    try {
      await removeTrailModule(moduleId)
      setTrails((prev) =>
        prev.map((t) => (t.id === trailId ? { ...t, modules: t.modules.filter((m) => m.id !== moduleId) } : t)),
      )
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao remover módulo.')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 p-6">Carregando trilhas...</div>

  const totals = {
    ativas: trails.filter((t) => t.active).length,
    modulos: trails.reduce((s, t) => s + t.modules.length, 0),
    alunos: trails.reduce((s, t) => s + t.enrolled, 0),
    conclusao: trails.length === 0 ? 0 : Math.round(trails.reduce((s, t) => s + t.completion, 0) / trails.length),
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciar Trilhas</h1>
            <p className="text-sm text-gray-500 mt-1">Crie e gerencie trilhas de aprendizado</p>
          </div>
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Nova Trilha
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {error && <p className="text-sm text-red-400">{error}</p>}

        {showNewForm && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Mobile com React Native"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Categoria</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Mobile"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleCreateTrail}
              disabled={!newName.trim() || !newCategory.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Criar Trilha
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: 'Trilhas Ativas', value: totals.ativas, color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: Layers, label: 'Módulos Totais', value: totals.modulos, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Users, label: 'Alunos Matriculados', value: totals.alunos.toLocaleString('pt-BR'), color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: CheckCircle, label: 'Taxa de Conclusão', value: `${totals.conclusao}%`, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="w-8" />
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trilha</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Categoria</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Módulos</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {trails.map((trail) => (
                  <>
                    <tr
                      key={trail.id}
                      className="border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow((cur) => (cur === trail.id ? null : trail.id))}
                    >
                      <td className="py-4 pl-4">
                        {expandedRow === trail.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-200">{trail.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColor(trail.category)}`}>
                          {trail.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-400">{trail.modules.length}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleActive(trail)}
                            className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${trail.active ? 'bg-green-600' : 'bg-gray-700'}`}
                          >
                            <span
                              className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 mt-1 ${trail.active ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(trail.id)}
                            className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${confirmDelete === trail.id ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-500 hover:text-red-400'}`}
                          >
                            {confirmDelete === trail.id ? 'Confirmar?' : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedRow === trail.id && (
                      <tr key={`${trail.id}-modules`}>
                        <td colSpan={6} className="bg-gray-800/40 border-b border-gray-800/60 px-6 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Módulos da trilha</p>
                            <button
                              onClick={() => setModuleForm(moduleForm === trail.id ? null : trail.id)}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Adicionar módulo
                            </button>
                          </div>

                          {moduleForm === trail.id && (
                            <div className="flex flex-col sm:flex-row gap-2 mb-4 bg-gray-900 rounded-lg p-3">
                              <input
                                type="text"
                                value={modTitle}
                                onChange={(e) => setModTitle(e.target.value)}
                                placeholder="Título do módulo"
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                              />
                              <input
                                type="number"
                                value={modDuration}
                                onChange={(e) => setModDuration(e.target.value)}
                                placeholder="Minutos"
                                className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                              />
                              <input
                                type="number"
                                value={modLessons}
                                onChange={(e) => setModLessons(e.target.value)}
                                placeholder="Aulas"
                                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                              />
                              <button
                                onClick={() => handleAddModule(trail.id)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                              >
                                Adicionar
                              </button>
                            </div>
                          )}

                          {trail.modules.length === 0 ? (
                            <p className="text-sm text-gray-500">Nenhum módulo cadastrado ainda.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {trail.modules.map((mod, idx) => (
                                <div key={mod.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 truncate">{mod.title}</p>
                                    <p className="text-xs text-gray-500">{mod.lessons} aulas · {formatDuration(mod.durationMinutes)}</p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveModule(trail.id, mod.id)}
                                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
