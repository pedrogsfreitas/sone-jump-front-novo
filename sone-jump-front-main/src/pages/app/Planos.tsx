import { useEffect, useState } from 'react'
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  Copy,
  TrendingUp,
  Building2,
  Star,
} from 'lucide-react'
import { getPlans, type Plan, type PlanKey } from '../../services/plans/plans'
import {
  getMySubscription,
  checkout,
  cancelSubscription,
  simulatePayment,
  type Subscription,
  type CheckoutResult,
} from '../../services/subscriptions/subscriptions'
import { getMyReferralStats, type ReferralStats } from '../../services/referrals/referrals'
import { ApiError } from '../../services/api'

const PLAN_ICON: Record<PlanKey, React.ReactNode> = {
  FREE: <Zap className="w-5 h-5 text-gray-400" />,
  PRO: <Sparkles className="w-5 h-5 text-purple-400" />,
  PREMIUM: <Crown className="w-5 h-5 text-yellow-400" />,
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })
}

export default function Planos() {
  const [isAnual, setIsAnual] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)

  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [referral, setReferral] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Only known for a checkout started in this session — there's no endpoint to
  // recover a payment id for an already-pending subscription after a refresh.
  const [pendingCheckout, setPendingCheckout] = useState<CheckoutResult | null>(null)
  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null)

  useEffect(() => {
    Promise.all([getPlans(), getMySubscription(), getMyReferralStats()])
      .then(([p, s, r]) => {
        setPlans(p)
        setSubscription(s)
        setReferral(r)
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar planos.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCheckout(planKey: Exclude<PlanKey, 'FREE'>) {
    setBusyPlan(planKey)
    setError('')
    try {
      const result = await checkout({ planKey, billingCycle: isAnual ? 'ANUAL' : 'MENSAL' })
      setPendingCheckout(result)
      const fresh = await getMySubscription()
      setSubscription(fresh)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao iniciar assinatura.')
    } finally {
      setBusyPlan(null)
    }
  }

  async function handleSimulate(outcome: 'PAGO' | 'FALHOU') {
    if (!pendingCheckout) return
    setBusyPlan(subscription?.plan.key ?? null)
    try {
      await simulatePayment(pendingCheckout.paymentId, outcome)
      setPendingCheckout(null)
      const fresh = await getMySubscription()
      setSubscription(fresh)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao simular pagamento.')
    } finally {
      setBusyPlan(null)
    }
  }

  async function handleCancel() {
    try {
      await cancelSubscription()
      const fresh = await getMySubscription()
      setSubscription(fresh)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao cancelar assinatura.')
    }
  }

  const handleCopyReferral = () => {
    if (!referral) return
    navigator.clipboard.writeText(referralLink(referral.code)).catch(() => {})
    setReferralCopied(true)
    setTimeout(() => setReferralCopied(false), 2000)
  }

  function referralLink(code: string): string {
    return `${window.location.origin}/register?ref=${code}`
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 p-6">Carregando planos...</div>
  if (!subscription || plans.length === 0) return null

  const currentKey = subscription.plan.key
  const isPending = subscription.status === 'PENDENTE'

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
        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Pending payment panel */}
        {isPending && pendingCheckout && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold">Pagamento pendente — R$ {formatCents(pendingCheckout.amountCents)}</p>
              <p className="text-gray-400 text-sm mt-1">{pendingCheckout.note}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleSimulate('PAGO')}
                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
              >
                Simular Pagamento Aprovado
              </button>
              <button
                onClick={() => handleSimulate('FALHOU')}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold border border-gray-700 transition-colors"
              >
                Simular Recusa
              </button>
            </div>
          </div>
        )}
        {isPending && !pendingCheckout && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 text-sm text-gray-300">
            Você tem um checkout pendente de uma sessão anterior. Sem um provedor de pagamento real
            configurado ainda, cancele e inicie de novo para poder simular a confirmação.
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const isCurrent = currentKey === plan.key && subscription.status === 'ATIVA'
            const isFree = plan.key === 'FREE'
            const highlighted = plan.key === 'PRO'
            const monthlyPrice = isAnual ? Math.round(plan.priceAnnualCents / 12) : plan.priceMonthlyCents

            return (
              <div
                key={plan.id}
                className={
                  highlighted
                    ? 'relative bg-gray-900 rounded-2xl border-2 border-purple-500/60 p-7 shadow-lg shadow-purple-500/10'
                    : 'bg-gray-900 rounded-2xl border border-gray-800 p-7'
                }
              >
                {highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Mais Popular
                    </span>
                  </div>
                )}
                <div className={`flex items-center gap-2 mb-4 ${highlighted ? 'mt-2' : ''}`}>
                  {PLAN_ICON[plan.key]}
                  <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                </div>
                <div className={isFree ? 'mb-6' : 'mb-1'}>
                  <span className="text-4xl font-bold text-white">
                    {isFree ? 'R$0' : `R$${formatCents(monthlyPrice)}`}
                  </span>
                  <span className="text-gray-500 ml-2">{isFree ? '/ sempre' : '/ mês'}</span>
                </div>
                {!isFree && isAnual && (
                  <p className="text-xs text-green-400 mb-5">
                    Cobrado anualmente (R${formatCents(plan.priceAnnualCents)}/ano)
                  </p>
                )}
                {!isFree && !isAnual && <div className="mb-5" />}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.key === 'PREMIUM' ? 'text-yellow-500' : plan.key === 'PRO' ? 'text-purple-400' : 'text-gray-500'
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {isFree ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-500 text-sm font-medium cursor-not-allowed border border-gray-700"
                  >
                    {currentKey === 'FREE' ? 'Plano Atual' : 'Incluso no Gratuito'}
                  </button>
                ) : isCurrent ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-500 text-sm font-medium cursor-not-allowed border border-gray-700"
                    >
                      Plano Atual
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full py-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Cancelar assinatura
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key as Exclude<PlanKey, 'FREE'>)}
                    disabled={busyPlan === plan.key || isPending}
                    className={
                      plan.key === 'PRO'
                        ? 'w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-md shadow-purple-500/20'
                        : 'w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors border border-yellow-500/30'
                    }
                  >
                    {busyPlan === plan.key ? 'Processando...' : `Assinar ${plan.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Programa de Afiliados */}
        {referral && (
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
                { label: 'Indicações', value: String(referral.referralsCount) },
                { label: 'Conversões', value: String(referral.conversionsCount) },
                { label: 'Ganhos totais', value: `R$ ${formatCents(referral.totalEarningsCents)}` },
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
                  {referralLink(referral.code)}
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
        )}

        {/* Para Empresas — informativo, sem fluxo de contato real ainda */}
        <section className="bg-gradient-to-br from-gray-900 to-indigo-950/30 rounded-2xl border border-indigo-500/20 p-7">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Para Empresas (B2B)</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Treine seu time de tecnologia com nossa plataforma. Painel de gestão, relatórios de progresso e
            conteúdo personalizado — em breve.
          </p>
        </section>
      </div>
    </div>
  )
}
