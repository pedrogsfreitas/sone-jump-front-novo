import { useState } from 'react'
import {
  Search,
  Eye,
  Edit,
  UserX,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserMinus,
  TrendingUp,
  Filter,
} from 'lucide-react'

type Plan = 'Grátis' | 'Pro' | 'Premium'
type Status = 'Ativo' | 'Inativo'

interface User {
  id: number
  name: string
  initials: string
  email: string
  plan: Plan
  status: Status
  registered: string
  lastAccess: string
  avatarColor: string
}

const users: User[] = [
  { id: 1, name: 'Maria Oliveira', initials: 'MO', email: 'maria.oliveira@email.com', plan: 'Pro', status: 'Ativo', registered: '12/01/2024', lastAccess: 'Hoje', avatarColor: 'bg-pink-600' },
  { id: 2, name: 'Carlos Mendes', initials: 'CM', email: 'carlos.mendes@email.com', plan: 'Premium', status: 'Ativo', registered: '05/02/2024', lastAccess: 'Ontem', avatarColor: 'bg-blue-600' },
  { id: 3, name: 'Ana Souza', initials: 'AS', email: 'ana.souza@email.com', plan: 'Grátis', status: 'Ativo', registered: '20/02/2024', lastAccess: '3 dias atrás', avatarColor: 'bg-green-600' },
  { id: 4, name: 'Lucas Ferreira', initials: 'LF', email: 'lucas.ferreira@email.com', plan: 'Pro', status: 'Inativo', registered: '01/03/2024', lastAccess: '15 dias atrás', avatarColor: 'bg-yellow-600' },
  { id: 5, name: 'Beatriz Lima', initials: 'BL', email: 'beatriz.lima@email.com', plan: 'Grátis', status: 'Ativo', registered: '10/03/2024', lastAccess: 'Hoje', avatarColor: 'bg-purple-600' },
  { id: 6, name: 'Rafael Costa', initials: 'RC', email: 'rafael.costa@email.com', plan: 'Premium', status: 'Inativo', registered: '22/03/2024', lastAccess: '30 dias atrás', avatarColor: 'bg-red-600' },
  { id: 7, name: 'Fernanda Rocha', initials: 'FR', email: 'fernanda.rocha@email.com', plan: 'Pro', status: 'Ativo', registered: '05/04/2024', lastAccess: 'Ontem', avatarColor: 'bg-teal-600' },
  { id: 8, name: 'Pedro Alves', initials: 'PA', email: 'pedro.alves@email.com', plan: 'Grátis', status: 'Ativo', registered: '18/04/2024', lastAccess: '2 dias atrás', avatarColor: 'bg-indigo-600' },
  { id: 9, name: 'Camila Nunes', initials: 'CN', email: 'camila.nunes@email.com', plan: 'Pro', status: 'Ativo', registered: '30/04/2024', lastAccess: 'Hoje', avatarColor: 'bg-orange-600' },
  { id: 10, name: 'Diego Martins', initials: 'DM', email: 'diego.martins@email.com', plan: 'Grátis', status: 'Inativo', registered: '12/05/2024', lastAccess: '20 dias atrás', avatarColor: 'bg-cyan-600' },
]

const planBadge: Record<Plan, string> = {
  Grátis: 'bg-gray-700 text-gray-300 border-gray-600',
  Pro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Premium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

const statusBadge: Record<Status, string> = {
  Ativo: 'bg-green-500/20 text-green-300 border-green-500/30',
  Inativo: 'bg-red-500/20 text-red-300 border-red-500/30',
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | Status>('Todos')
  const [planFilter, setPlanFilter] = useState<'Todos' | Plan>('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Todos' || u.status === statusFilter
    const matchPlan = planFilter === 'Todos' || u.plan === planFilter
    return matchSearch && matchStatus && matchPlan
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">Visualize, edite e gerencie todos os usuários da plataforma</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total de Usuários', value: '12.847', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: UserCheck, label: 'Usuários Ativos', value: '9.312', color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: UserMinus, label: 'Usuários Inativos', value: '3.535', color: 'text-red-400', bg: 'bg-red-500/10' },
            { icon: TrendingUp, label: 'Novos (30 dias)', value: '428', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1) }}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option>Todos</option>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value as typeof planFilter); setCurrentPage(1) }}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option>Todos</option>
              <option>Grátis</option>
              <option>Pro</option>
              <option>Premium</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Usuário</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">E-mail</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plano</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cadastro</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Último Acesso</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  paginated.map((user, i) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors ${
                        i % 2 === 0 ? '' : 'bg-gray-900/40'
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${user.avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                            {user.initials}
                          </div>
                          <span className="text-sm font-medium text-gray-200">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${planBadge[user.plan]}`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400">{user.registered}</td>
                      <td className="py-4 px-4 text-sm text-gray-400">{user.lastAccess}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-blue-400 transition-colors" title="Ver perfil">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-yellow-400 transition-colors" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors" title="Desativar">
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Mostrando {Math.min((currentPage - 1) * perPage + 1, filtered.length)}–{Math.min(currentPage * perPage, filtered.length)} de {filtered.length} usuários
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
