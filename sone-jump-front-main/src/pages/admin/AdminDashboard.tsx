import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserPlus,
  CheckCircle,
  MessageSquare,
  LayoutDashboard,
  FilePlus,
  BarChart2,
  RefreshCw,
} from 'lucide-react'
import { getAdminDashboard, type AdminDashboard as AdminDashboardData } from '../../services/admin-reports/admin-reports'
import { ApiError } from '../../services/api'

const ACTIVITY_ICON = {
  post: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  completion: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  registration: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
} as const

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function monthLabel(ym: string): string {
  return MONTH_LABELS[ym.slice(5, 7)] ?? ym
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  function refresh() {
    setLoading(true)
    getAdminDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar dashboard.'))
      .finally(() => setLoading(false))
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 p-6">Carregando painel...</div>
  if (error) return <div className="min-h-screen bg-gray-950 text-red-400 p-6">{error}</div>
  if (!data) return null

  const maxUsers = Math.max(1, ...data.monthlyGrowth.map((m) => m.users))

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-sm text-gray-500 capitalize mt-0.5">{today}</p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar dados
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { icon: Users, label: 'Usuários Totais', value: data.totalUsers.toLocaleString('pt-BR'), color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: BookOpen, label: 'Trilhas Ativas', value: String(data.activeTrails), color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: DollarSign, label: 'Receita do Mês', value: `R$ ${(data.monthlyRevenueCents / 100).toLocaleString('pt-BR')}`, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: TrendingUp, label: 'Conversão', value: `${data.conversionRate}%`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Crescimento de Usuários (6 meses)</h2>
          <div className="flex items-end gap-3 h-44">
            {data.monthlyGrowth.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">{item.users.toLocaleString('pt-BR')}</span>
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.max(4, (item.users / maxUsers) * 100)}%` }}
                />
                <span className="text-xs text-gray-500">{monthLabel(item.month)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Atividade Recente</h2>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma atividade recente.</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((act, i) => {
                  const { icon: Icon, color, bg } = ACTIVITY_ICON[act.type]
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{act.text}</p>
                      </div>
                      <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(act.at)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Ações Rápidas</h2>
            <div className="space-y-3">
              {[
                { icon: Users, label: 'Gerenciar Usuários', desc: `${data.totalUsers.toLocaleString('pt-BR')} cadastrados`, color: 'text-blue-400', bg: 'bg-blue-500/10', to: '/admin/users' },
                { icon: FilePlus, label: 'Criar Conteúdo', desc: 'Novo módulo ou trilha', color: 'text-green-400', bg: 'bg-green-500/10', to: '/admin/conteudos' },
                { icon: BarChart2, label: 'Ver Relatórios', desc: 'Dados de engajamento', color: 'text-yellow-400', bg: 'bg-yellow-500/10', to: '/admin/relatorios' },
                { icon: LayoutDashboard, label: 'Gerenciar Trilhas', desc: `${data.activeTrails} trilhas ativas`, color: 'text-purple-400', bg: 'bg-purple-500/10', to: '/admin/trilhas' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors text-left group"
                >
                  <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
