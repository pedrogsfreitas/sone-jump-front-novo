import { useEffect, useState, type FormEvent } from 'react'
import { Users, Plus, Pencil, Trash2, X, MessageSquare } from 'lucide-react'
import {
  getAdminGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  type AdminGroup,
} from '../../services/admin-groups/admin-groups'
import { ApiError } from '../../services/api'

export default function AdminGrupos() {
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  // O mesmo formulário serve para criar e editar: `editing` diz qual dos dois.
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AdminGroup | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    getAdminGroups()
      .then(setGroups)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar grupos.'))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditing(null)
    setName('')
    setIcon('')
    setFormError('')
    setShowForm(true)
  }

  function openEdit(group: AdminGroup) {
    setEditing(group)
    setName(group.name)
    setIcon(group.icon ?? '')
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nome = name.trim()
    if (!nome) return

    setFormError('')
    setSaving(true)
    try {
      if (editing) {
        const atualizado = await updateGroup(editing.id, { name: nome, icon: icon.trim() || undefined })
        setGroups((prev) =>
          prev.map((g) => (g.id === editing.id ? { ...g, ...atualizado } : g)),
        )
      } else {
        const criado = await createGroup({ name: nome, icon: icon.trim() || undefined })
        setGroups((prev) => [...prev, { ...criado, membersCount: 0, postsCount: 0 }])
      }
      setShowForm(false)
    } catch (err) {
      // Nome repetido volta como 409 com texto pronto: mostra no formulário, que é
      // onde a pessoa corrige, em vez de no topo da página.
      setFormError(err instanceof ApiError ? err.message : 'Erro ao salvar grupo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(group: AdminGroup) {
    const confirmed = window.confirm(
      `Apagar o grupo "${group.name}"? Essa ação não pode ser desfeita.`,
    )
    if (!confirmed) return

    setActionError('')
    try {
      await deleteGroup(group.id)
      setGroups((prev) => prev.filter((g) => g.id !== group.id))
    } catch (e) {
      // O back recusa apagar grupo com publicações, e a mensagem já diz quantas são.
      setActionError(e instanceof ApiError ? e.message : 'Erro ao apagar grupo.')
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Carregando grupos...</div>
  if (error) return <div className="p-6 text-red-400">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Grupos da Comunidade</h1>
          <p className="text-gray-400 text-sm mt-1">
            Cada grupo tem seu próprio feed. Só quem participa pode publicar nele.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo grupo
        </button>
      </div>

      {actionError && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum grupo cadastrado ainda.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-400">
              <tr>
                <th className="py-3 px-4">Grupo</th>
                <th className="py-3 px-4">Membros</th>
                <th className="py-3 px-4">Publicações</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-t border-gray-800">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{g.icon ?? '💬'}</span>
                      <span className="text-sm font-medium text-white">{g.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    {g.membersCount.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {g.postsCount.toLocaleString('pt-BR')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(g)}
                        title="Editar grupo"
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(g)}
                        title={
                          g.postsCount > 0
                            ? 'Grupo com publicações não pode ser apagado'
                            : 'Apagar grupo'
                        }
                        disabled={g.postsCount > 0}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 disabled:opacity-40 disabled:hover:bg-gray-800 disabled:hover:text-gray-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                {editing ? 'Editar grupo' : 'Novo grupo'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {formError}
              </div>
            )}

            <label className="block text-xs font-medium text-gray-400 mb-1.5">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Front-end"
              maxLength={60}
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-xl px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />

            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Ícone (opcional)
            </label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🚀"
              maxLength={8}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-xl px-3 py-2.5 mb-5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar grupo'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
