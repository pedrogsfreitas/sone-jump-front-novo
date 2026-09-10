import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Map, BookOpen, TrendingUp, Award,
  Users, Briefcase, UserCheck, Video, User, CreditCard,
  Settings, LogOut, Zap, Mail
} from 'lucide-react'
import { apiRequest, ensureSession } from '../services/api'
import { clearToken } from '../services/auth-storage'
import { getMe, type UserProfile } from '../services/users/users'
import { resendVerification } from '../services/email-verification/email-verification'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/app/catalog', icon: BookOpen, label: 'Catálogo' },
  { to: '/app/progress', icon: TrendingUp, label: 'Progresso' },
  { to: '/app/skills', icon: Award, label: 'Skills' },
  { to: '/app/community', icon: Users, label: 'Comunidade' },
  { to: '/app/market', icon: Briefcase, label: 'Mercado' },
  { to: '/app/mentoria', icon: UserCheck, label: 'Mentoria' },
  { to: '/app/lives', icon: Video, label: 'Lives' },
  { to: '/app/profile', icon: User, label: 'Perfil' },
  { to: '/app/planos', icon: CreditCard, label: 'Planos' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')

  useEffect(() => {
    let cancelled = false
    // `ensureSession` renova pelo refresh token quando o access token já expirou —
    // sem isso, recarregar a página 15 minutos depois do login expulsava a pessoa.
    void ensureSession().then((hasSession) => {
      if (cancelled) return
      if (!hasSession) {
        navigate('/login')
        return
      }
      getMe()
        .then((profile) => {
          if (!cancelled) setUser(profile)
        })
        .catch(() => {})
    })
    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleResendVerification = async () => {
    setResendState('sending')
    // O servidor responde 204 mesmo se já estiver confirmado; não há erro útil para
    // mostrar aqui, e a confirmação some sozinha no próximo carregamento.
    await resendVerification().catch(() => {})
    setResendState('sent')
  }

  const handleLogout = () => {
    // Best-effort: also revoke the refresh-token cookie server-side. Not awaited —
    // the user should be able to leave immediately either way.
    void apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {})
    clearToken()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-wider">JUMP</span>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user ? initials(user.fullName) : '...'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.fullName ?? 'Carregando...'}</p>
              <p className="text-zinc-500 text-xs truncate">
                {user ? `Nível ${user.level} · ${user.xpTotal.toLocaleString('pt-BR')} XP` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-zinc-800 space-y-0.5">
          {/* Não há tela de Configurações separada: o Perfil já concentra os campos
              da conta, inclusive a troca de senha. Apontar para lá evita uma rota morta. */}
          <NavLink
            to="/app/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#050505]">
        {/* Aviso, não bloqueio: a conta funciona sem o e-mail confirmado. Ele existe
            para que a recuperação de senha tenha para onde ir — travar o acesso
            transformaria um problema de entrega em impossibilidade de usar o produto. */}
        {user && !user.emailVerified && (
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 text-sm">
            <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-amber-200">
              Confirme seu e-mail para conseguir recuperar a senha depois.
            </span>
            <button
              onClick={handleResendVerification}
              disabled={resendState !== 'idle'}
              className="text-amber-300 underline underline-offset-2 hover:text-amber-100 disabled:no-underline disabled:text-amber-500/60 transition-colors"
            >
              {resendState === 'sent'
                ? 'E-mail reenviado'
                : resendState === 'sending'
                  ? 'Enviando...'
                  : 'Reenviar e-mail'}
            </button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
