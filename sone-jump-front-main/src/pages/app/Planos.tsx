import { useState } from 'react'
import {
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
  Copy,
  Users,
  TrendingUp,
  Building2,
  ChevronRight,
  Star,
} from 'lucide-react'

const planFeatures = {
  gratuito: [
    'Acesso a 3 trilhas gratuitas',
    'Até 10 exercícios por mês',
    'Fórum da comunidade',
    'Certificado básico',
    'Suporte por e-mail',
  ],
  pro: [
    'Todas as trilhas disponíveis',
    'Exercícios ilimitados',
    'Mentoria em grupo (2x/mês)',
    'Certificados verificáveis',
    'Suporte prioritário (chat)',
    'Projetos práticos guiados',
    'Modo Foco avançado',
    'Cartão de perfil premium',
    'Acesso antecipado a conteúdos',
    'Integração com GitHub',
  ],
  premium: [
    'Tudo do plano Pro',
    'Mentoria individual (4x/mês)',
    'Revisão de código 1:1',
    'Preparação para entrevistas',
    'Acesso a vagas exclusivas',
    'Networking com empresas parceiras',
    'Dashboard de progresso avançado',
    'API de integração',
    'White-label do perfil',
    'Suporte dedicado 24/7',
    'Acesso vitalício ao conteúdo',
    'Early access a novos produtos',
  ],
}

const comparisonRows = [
  { feature: 'Trilhas de aprendizado', gratuito: '3', pro: 'Ilimitadas', premium: 'Ilimitadas' },
  { feature: 'Exercícios práticos', gratuito: '10/mês', pro: 'Ilimitados', premium: 'Ilimitados' },
  { feature: 'Certificados', gratuito: false, pro: true, premium: true },
  { feature: 'Mentoria em grupo', gratuito: false, pro: true, premium: true },
  { feature: 'Mentoria individual', gratuito: false, pro: false, premium: true },
  { feature: 'Revisão de código', gratuito: false, pro: false, premium: true },
  { feature: 'Acesso a vagas', gratuito: false, pro: false, premium: true },
  { feature: 'Suporte', gratuito: 'E-mail', pro: 'Chat', premium: 'Dedicado 24/7' },
  { feature: 'Projetos práticos', gratuito: false, pro: true, premium: true },
  { feature: 'Networking empresas', gratuito: false, pro: false, premium: true },
]

type CellValue = boolean | string

function Cell({ value }: { value: CellValue }) {
  if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />
  if (value === false) return <X className="w-4 h-4 text-gray-600 mx-auto" />
  return <span className="text-sm text-gray-300">{value}</span>
}

export default function Planos() {
  const [isAnual, setIsAnual] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)

  const handleCopyReferral = () => {
    setReferralCopied(true)
    setTimeout(() => setReferralCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-10 px-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Escolha seu Plano</h1>
        <p className="text-gray-400 mb-6">Invista na sua carreira tech. Cancele quando quiser.</p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setIsAnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isAnual ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setIsAnual(true)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAnual ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Anual
            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Gratuito */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-7">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Gratuito</h2>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">R$0</span>
              <span className="text-gray-500 ml-2">/ sempre</span>
            </div>
            <ul className="space-y-3 mb-8">
              {planFeatures.gratuito.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-500 text-sm font-medium cursor-not-allowed border border-gray-700"
            >
              Plano Atual
            </button>
          </div>

          {/* Pro — highlighted */}
          <div className="relative bg-gray-900 rounded-2xl border-2 border-purple-500/60 p-7 shadow-lg shadow-purple-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Mais Popular
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4 mt-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Pro</h2>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-bold text-white">
                R${isAnual ? '39' : '49'}
              </span>
              <span className="text-gray-500 ml-2">/ mês</span>
            </div>
            {isAnual && (
              <p className="text-xs text-green-400 mb-5">Cobrado anualmente (R$468/ano)</p>
            )}
            {!isAnual && <div className="mb-5" />}
            <ul className="space-y-3 mb-8">
              {planFeatures.pro.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-purple-500/20">
              Assinar Pro
            </button>
          </div>

          {/* Premium */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-7">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Premium</h2>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-bold text-white">
                R${isAnual ? '79' : '99'}
              </span>
              <span className="text-gray-500 ml-2">/ mês</span>
            </div>
            {isAnual && (
              <p className="text-xs text-green-400 mb-5">Cobrado anualmente (R$948/ano)</p>
            )}
            {!isAnual && <div className="mb-5" />}
            <ul className="space-y-3 mb-8">
              {planFeatures.premium.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition-colors border border-yellow-500/30">
              Assinar Premium
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <section>
          <h2 className="text-xl font-bold text-white mb-5">Comparativo de Funcionalidades</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800">
                  <th className="text-left py-4 px-5 text-sm text-gray-400 font-medium w-1/2">Funcionalidade</th>
                  <th className="text-center py-4 px-4 text-sm text-gray-400 font-medium">Gratuito</th>
                  <th className="text-center py-4 px-4 text-sm text-purple-400 font-semibold">Pro</th>
                  <th className="text-center py-4 px-4 text-sm text-yellow-400 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-800/60 ${i % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-900/20'}`}
                  >
                    <td className="py-3.5 px-5 text-sm text-gray-300">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Cell value={row.gratuito} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Cell value={row.pro} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Cell value={row.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Programa de Afiliados */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-7">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Programa de Afiliados</h2>
              <p className="text-sm text-gray-400 mt-1">
                Indique amigos e ganhe <span className="text-green-400 font-semibold">30% de comissão recorrente</span> por cada assinante ativo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Indicações', value: '8' },
              { label: 'Conversões', value: '3' },
              { label: 'Ganhos totais', value: 'R$ 352,20' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-800/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Seu link de indicação</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 font-mono truncate">
                https://sonejump.com.br/ref/joaosilva
              </div>
              <button
                onClick={handleCopyReferral}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
              >
                <Copy className="w-4 h-4" />
                {referralCopied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </section>

        {/* Para Empresas */}
        <section className="bg-gradient-to-br from-gray-900 to-indigo-950/30 rounded-2xl border border-indigo-500/20 p-7">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Para Empresas (B2B)</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Treine seu time de tecnologia com nossa plataforma. Painel de gestão, relatórios de progresso e conteúdo personalizado.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Licenças em volume',
                  'Painel de RH integrado',
                  'Trilhas personalizadas',
                  'Relatórios de desempenho',
                  'SSO / LDAP',
                  'Suporte dedicado',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors">
                Falar com Vendas <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">Resposta em até 24h úteis</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
