import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard, Map, BookOpen, TrendingUp, Award,
  Users, Briefcase, UserCheck, Video, User, CreditCard,
  Settings, LogOut, Zap
} from 'lucide-react'
import { apiRequest } from '../services/api'
import { clearToken, getToken, isTokenValid } from '../services/auth-storage'

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
  useEffect(() => {
    if (!isTokenValid(getToken())) navigate('/login')
  }, [navigate])

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
              JS
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">João Silva</p>
              <p className="text-zinc-500 text-xs truncate">Nível 7 · 1.240 XP</p>
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
          <NavLink
            to="/app/settings"
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
        <Outlet />
      </main>
    </div>
  )
}
