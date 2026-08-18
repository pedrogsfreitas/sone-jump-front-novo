import { useState } from 'react'
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  Star,
  Clock,
  Calendar,
  Eye,
  BookOpen,
} from 'lucide-react'

const engagementData = [
  { title: 'HTML5 Semântico — Guia Completo', type: 'Video', views: 8420, avgTime: '38min', completion: 84, rating: 4.8 },
  { title: 'Como usar Flexbox no CSS', type: 'Video', views: 5640, avgTime: '24min', completion: 79, rating: 4.7 },
  { title: 'JavaScript: Promises e Async/Await', type: 'Artigo', views: 3210, avgTime: '10min', completion: 92, rating: 4.5 },
  { title: 'Quiz: Fundamentos de React', type: 'Quiz', views: 4890, avgTime: '12min', completion: 96, rating: 4.6 },
  { title: 'Projeto: Todo App com React', type: 'Projeto', views: 2340, avgTime: '2h 40min', completion: 61, rating: 4.9 },
  { title: 'TypeScript para Iniciantes', type: 'Video', views: 6780, avgTime: '58min', completion: 76, rating: 4.7 },
  { title: 'REST APIs: Teoria e Prática', type: 'PDF', views: 1230, avgTime: '—', completion: 68, rating: 4.3 },
]

const funnelSteps = [
  { label: 'Visitantes', value: 42800, percent: 100 },
  { label: 'Cadastros', value: 12847, percent: 30 },
  { label: 'Ativações', value: 8940, percent: 21 },
  { label: 'Assinantes', value: 3120, percent: 7.3 },
  { label: 'Premium', value: 840, percent: 2 },
]

// Cohort data: months as columns, cohorts as rows
const cohortMonths = ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6']
const cohorts = [
  { label: 'Jan 24', values: [100, 68, 52, 41, 35, 29] },
  { label: 'Fev 24', values: [100, 72, 58, 46, 38, null] },
  { label: 'Mar 24', values: [100, 70, 55, 43, null, null] },
  { label: 'Abr 24', values: [100, 74, 59, null, null, null] },
  { label: 'Mai 24', values: [100, 71, null, null, null, null] },
  { label: 'Jun 24', values: [100, null, null, null, null, null] },
]

function cohortColor(value: number | null): string {
  if (value === null) return 'bg-gray-800 text-gray-600'
  if (value >= 80) return 'bg-green-600/80 text-white'
  if (value >= 60) return 'bg-green-600/50 text-green-200'
  if (value >= 40) return 'bg-yellow-600/50 text-yellow-200'
  if (value >= 20) return 'bg-orange-600/40 text-orange-200'
  return 'bg-red-600/30 text-red-300'
}

const typeBadgeMap: Record<string, string> = {
  Video: 'bg-red-500/20 text-red-300 border-red-500/30',
  Artigo: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Quiz: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Projeto: 'bg-green-500/20 text-green-300 border-green-500/30',
  PDF: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export default function AdminRelatorios() {
  const [dateFrom, setDateFrom] = useState('2024-01-01')
  const [dateTo, setDateTo] = useState('2024-06-30')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Relatórios</h1>
            <p className="text-sm text-gray-500 mt-1">Análise de desempenho e engajamento da plataforma</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range */}
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none"
              />
              <span className="text-gray-600">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none"
              />
            </div>
            {/* Export Buttons */}
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-xl transition-colors">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-xl transition-colors">
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Novos Usuários', value: '4.280', change: '+18%', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: TrendingUp, label: 'Receita no Período', value: 'R$ 182.400', change: '+24%', color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: BookOpen, label: 'Conclusões de Curso', value: '3.940', change: '+12%', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Star, label: 'Avaliação Média', value: '4.6 / 5', change: '+0.2', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          ].map((m) => (
            <div key={m.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{m.change}</span>
              </div>
              <p className="text-xl font-bold text-white">{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Engagement Table */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Engajamento por Conteúdo</h2>
            <p className="text-sm text-gray-500 mt-0.5">Período selecionado</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Conteúdo</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo</th>
                  <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <div className="flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Views</div>
                  </th>
                  <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <div className="flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> T. Médio</div>
                  </th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Conclusão</th>
                  <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nota</th>
                </tr>
              </thead>
              <tbody>
                {engagementData.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-900/40'}`}>
                    <td className="py-3.5 px-5 text-sm text-gray-200">{row.title}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeBadgeMap[row.type]}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-sm text-gray-300">{row.views.toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 text-center text-sm text-gray-400">{row.avgTime}</td>
                    <td className="py-3.5 px-4 min-w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${row.completion}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{row.completion}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-300">{row.rating.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Funil de Conversão</h2>
            <div className="space-y-3">
              {funnelSteps.map((step) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="w-20 text-right text-xs text-gray-500 flex-shrink-0">{step.label}</div>
                  <div className="flex-1 relative h-9 bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg flex items-center px-3 transition-all duration-700"
                      style={{ width: `${step.percent}%`, minWidth: '2rem' }}
                    >
                      <span className="text-xs font-semibold text-white whitespace-nowrap">
                        {step.value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <span className="w-12 text-xs text-gray-500 text-right flex-shrink-0">{step.percent}%</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-800">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Taxa visita → cadastro</span>
                <span className="text-green-400 font-medium">30.0%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                <span>Taxa cadastro → assinante</span>
                <span className="text-green-400 font-medium">24.3%</span>
              </div>
            </div>
          </section>

          {/* Cohort Retention */}
          <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Retenção de Usuários</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pb-3 pr-3 text-gray-500 font-medium">Coorte</th>
                    {cohortMonths.map((m) => (
                      <th key={m} className="pb-3 px-1 text-gray-500 font-medium text-center">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((cohort) => (
                    <tr key={cohort.label}>
                      <td className="py-1 pr-3 text-gray-400 font-medium whitespace-nowrap">{cohort.label}</td>
                      {cohort.values.map((v, j) => (
                        <td key={j} className="py-1 px-1">
                          <div className={`h-8 w-12 rounded-md flex items-center justify-center text-xs font-semibold ${cohortColor(v)}`}>
                            {v !== null ? `${v}%` : '—'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-600/80" /> {'≥ 80%'}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-600/50" /> {'40–60%'}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-600/30" /> {'< 20%'}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
