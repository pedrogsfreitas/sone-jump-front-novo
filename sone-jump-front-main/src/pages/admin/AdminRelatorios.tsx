import { useEffect, useState } from 'react'
import { Download, TrendingUp, Users, Star, Calendar, BookOpen } from 'lucide-react'
import {
  getAdminOverview,
  getAdminFunnel,
  getAdminCohorts,
  type AdminOverview,
  type FunnelStep,
  type CohortRow,
} from '../../services/admin-reports/admin-reports'
import { ApiError } from '../../services/api'

function cohortColor(value: number | null): string {
  if (value === null) return 'bg-gray-800 text-gray-600'
  if (value >= 80) return 'bg-green-600/80 text-white'
  if (value >= 60) return 'bg-green-600/50 text-green-200'
  if (value >= 40) return 'bg-yellow-600/50 text-yellow-200'
  if (value >= 20) return 'bg-orange-600/40 text-orange-200'
  return 'bg-red-600/30 text-red-300'
}

function isoDateMonthsAgo(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminRelatorios() {
  const [dateFrom, setDateFrom] = useState(isoDateMonthsAgo(6))
  const [dateTo, setDateTo] = useState(todayIso())

  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  const [cohorts, setCohorts] = useState<CohortRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getAdminOverview(dateFrom, dateTo), getAdminFunnel(dateFrom, dateTo), getAdminCohorts()])
      .then(([o, f, c]) => { setOverview(o); setFunnel(f); setCohorts(c) })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar relatórios.'))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo])

  function handleExportCsv() {
    if (!overview) return
    const rows: string[][] = [
      ['Relatório', `${dateFrom} a ${dateTo}`],
      [],
      ['Métrica', 'Valor'],
      ['Novos Usuários', String(overview.newUsers)],
      ['Receita no Período (R$)', (overview.revenueCents / 100).toFixed(2)],
      ['Conclusões de Curso', String(overview.courseCompletions)],
      ['Avaliação Média', overview.avgContentRating.toFixed(1)],
      [],
      ['Funil de Conversão'],
      ['Etapa', 'Valor', '% do total'],
      ...funnel.map((f) => [f.label, String(f.value), `${f.percent}%`]),
    ]
    downloadCsv(`relatorio-${dateFrom}-a-${dateTo}.csv`, rows)
  }

  const cohortMonths = cohorts[0]?.values.length ?? 6

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
            <button
              onClick={handleExportCsv}
              disabled={!overview}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 border border-gray-700 text-gray-300 text-sm rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-500">Carregando relatórios...</p>
        ) : overview ? (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Novos Usuários', value: overview.newUsers.toLocaleString('pt-BR'), color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: TrendingUp, label: 'Receita no Período', value: `R$ ${(overview.revenueCents / 100).toLocaleString('pt-BR')}`, color: 'text-green-400', bg: 'bg-green-500/10' },
                { icon: BookOpen, label: 'Conclusões de Curso', value: overview.courseCompletions.toLocaleString('pt-BR'), color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { icon: Star, label: 'Avaliação Média', value: `${overview.avgContentRating.toFixed(1)} / 5`, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              ].map((m) => (
                <div key={m.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                  <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <p className="text-xl font-bold text-white">{m.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-5">Funil de Conversão</h2>
                {funnel.length === 0 ? (
                  <p className="text-sm text-gray-500">Sem cadastros no período selecionado.</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {funnel.map((step) => (
                        <div key={step.label} className="flex items-center gap-4">
                          <div className="w-20 text-right text-xs text-gray-500 flex-shrink-0">{step.label}</div>
                          <div className="flex-1 relative h-9 bg-gray-800 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg flex items-center px-3 transition-all duration-700"
                              style={{ width: `${Math.max(step.percent, 4)}%`, minWidth: '2rem' }}
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
                    {funnel.length >= 3 && funnel[0].value > 0 && (
                      <div className="mt-5 pt-4 border-t border-gray-800">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Taxa cadastro → ativação</span>
                          <span className="text-green-400 font-medium">{funnel[1].percent}%</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                          <span>Taxa ativação → assinante</span>
                          <span className="text-green-400 font-medium">
                            {funnel[1].value === 0 ? '0.0' : ((funnel[2].value / funnel[1].value) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Cohort Retention */}
              <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-5">Retenção de Usuários</h2>
                {cohorts.length === 0 ? (
                  <p className="text-sm text-gray-500">Sem dados de coorte ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left pb-3 pr-3 text-gray-500 font-medium">Coorte</th>
                          {Array.from({ length: cohortMonths }, (_, i) => (
                            <th key={i} className="pb-3 px-1 text-gray-500 font-medium text-center">Mês {i + 1}</th>
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
                )}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-600/80" /> {'≥ 80%'}</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-600/50" /> {'40–60%'}</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-600/30" /> {'< 20%'}</div>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
