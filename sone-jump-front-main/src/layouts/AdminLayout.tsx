import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard, Users, BookOpen, FileText, Handshake, BarChart2,
  LogOut, Shield
} from 'lucide-react'
import { apiRequest } from '../services/api'
import { clearToken, getRole, getToken, isTokenValid } from '../services/auth-storage'

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
  { to: '/admin/trilhas', icon: BookOpen, label: 'Trilhas' },
  { to: '/admin/conteudos', icon: FileText, label: 'Conteúdos' },
  { to: '/admin/parceiros', icon: Handshake, label: 'Parceiros' },
  { to: '/admin/relatorios', icon: BarChart2, label: 'Relatórios' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (!isTokenValid(token)) {
      navigate('/login')
      return
    }
    // Authenticated but not an admin: send them back into the app rather than
    // /login (they do have a valid session — they just can't be here).
    if (getRole(token) !== 'ADMIN') navigate('/app/dashboard')
  }, [navigate])

  const handleLogout = () => {
    void apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {})
    clearToken()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-wider">JUMP</span>
              <span className="ml-2 text-xs text-red-400 font-medium bg-red-500/10 px-1.5 py-0.5 rounded">Admin</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Admin User</p>
              <p className="text-zinc-500 text-xs">Administrador</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#050505]">
        <Outlet />
      </main>
    </div>
  )
}
