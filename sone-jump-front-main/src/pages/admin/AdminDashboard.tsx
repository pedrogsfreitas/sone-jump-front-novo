import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserPlus,
  CheckCircle,
  CreditCard,
  AlertCircle,
  LayoutDashboard,
  FilePlus,
  BarChart2,
  RefreshCw,
} from 'lucide-react'

const monthlyGrowth = [
  { month: 'Jan', users: 820, height: 45 },
  { month: 'Fev', users: 1140, height: 63 },
  { month: 'Mar', users: 980, height: 54 },
  { month: 'Abr', users: 1560, height: 86 },
  { month: 'Mai', users: 1820, height: 100 },
  { month: 'Jun', users: 1420, height: 78 },
]

const activities = [
  { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', text: 'Maria Oliveira criou uma conta', time: '3 min atrás' },
  { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', text: 'Carlos Mendes concluiu "React Avançado"', time: '17 min atrás' },
  { icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10', text: 'Ana Souza assinou o plano Pro', time: '34 min atrás' },
  { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', text: 'Lucas Ferreira criou uma conta', time: '1h atrás' },
  { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', text: 'Beatriz Lima concluiu "HTML & CSS do Zero"', time: '1h 20min atrás' },
  { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', text: 'Rafael Costa cancelou assinatura Premium', time: '2h atrás' },
  { icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10', text: 'Fernanda Rocha assinou o plano Premium', time: '3h atrás' },
  { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', text: 'Pedro Alves concluiu "Git & GitHub"', time: '4h atrás' },
]

const trails = [
  { name: 'Frontend', percent: 38, color: 'bg-purple-500' },
  { name: 'Backend', percent: 27, color: 'bg-blue-500' },
  { name: 'Full Stack', percent: 19, color: 'bg-cyan-500' },
  { name: 'DevOps', percent: 10, color: 'bg-orange-500' },
  { name: 'Data Science', percent: 6, color: 'bg-pink-500' },
]

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-sm text-gray-500 capitalize mt-0.5">{today}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors self-start sm:self-auto">
            <RefreshCw className="w-4 h-4" /> Atualizar dados
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            {
              icon: Users,
              label: 'Usuários Totais',
              value: '12.847',
              change: '+8.2%',
              changeType: 'up',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
            },
            {
              icon: BookOpen,
              label: 'Cursos Ativos',
              value: '342',
              change: '+5 este mês',
              changeType: 'up',
              color: 'text-green-400',
              bg: 'bg-green-500/10',
            },
            {
              icon: DollarSign,
              label: 'Receita Mensal',
              value: 'R$ 89.420',
              change: '+12.4%',
              changeType: 'up',
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
            },
            {
              icon: TrendingUp,
              label: 'Conversão',
              value: '8.3%',
              change: '+0.4%',
              changeType: 'up',
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Crescimento de Usuários</h2>
            <div className="flex items-end gap-3 h-44">
              {monthlyGrowth.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">{item.users.toLocaleString('pt-BR')}</span>
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${item.height}%` }}
                  />
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Users by Trail */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Usuários por Trilha</h2>
            <div className="space-y-4">
              {trails.map((trail) => (
                <div key={trail.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300">{trail.name}</span>
                    <span className="text-gray-500">{trail.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${trail.color} rounded-full transition-all duration-700`}
                      style={{ width: `${trail.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Donut-style legend */}
            <div className="mt-6 pt-5 border-t border-gray-800">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-3">Distribuição</p>
              <div className="relative w-28 h-28 mx-auto">
                <div className="w-full h-full rounded-full border-8 border-purple-500 border-r-blue-500 border-b-cyan-500 border-l-orange-500 rotate-45" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center leading-tight">5<br/>trilhas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Atividade Recente</h2>
            <div className="space-y-3">
              {activities.map((act, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${act.bg} flex items-center justify-center flex-shrink-0`}>
                    <act.icon className={`w-4 h-4 ${act.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{act.text}</p>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Ações Rápidas</h2>
            <div className="space-y-3">
              {[
                { icon: Users, label: 'Gerenciar Usuários', desc: '12.847 cadastrados', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: FilePlus, label: 'Criar Conteúdo', desc: 'Novo módulo ou trilha', color: 'text-green-400', bg: 'bg-green-500/10' },
                { icon: BarChart2, label: 'Ver Relatórios', desc: 'Dados de engajamento', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { icon: LayoutDashboard, label: 'Gerenciar Trilhas', desc: '342 trilhas ativas', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((action) => (
                <button
                  key={action.label}
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
