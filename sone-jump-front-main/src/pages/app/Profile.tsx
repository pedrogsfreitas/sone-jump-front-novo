import { useEffect, useState } from 'react'
import {
  Calendar,
  Zap,
  Flame,
  Code2,
  Edit3,
  Target,
} from 'lucide-react'
import { getMe, updateMe, type UserProfile } from '../../services/users/users'
import { getSkillProgress } from '../../services/skills/skills'
import { ApiError } from '../../services/api'
import { formatDate } from '../../utils/format'

const colorOptions = [
  { id: 'purple', class: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
  { id: 'blue', class: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
  { id: 'green', class: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { id: 'orange', class: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { id: 'pink', class: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  { id: 'yellow', class: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
]

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<{ name: string; pct: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [focusMode, setFocusMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState('purple')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([getMe(), getSkillProgress()])
      .then(([u, sk]) => {
        setUser(u);
        setSkills(sk);
        setFocusMode(u.focusMode);
        setSelectedColor(u.avatarColor);
        setUsername(u.username);
        setBio(u.bio ?? '');
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erro ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const avatarColor = colorOptions.find((c) => c.id === selectedColor)?.class ?? colorOptions[0].class

  async function handleSave() {
    setSaveError('');
    setSaving(true);
    try {
      const updated = await updateMe({ username, bio, avatarColor: selectedColor, focusMode });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 p-6">Carregando perfil...</div>;
  if (error) return <div className="min-h-screen bg-gray-950 text-red-400 p-6">{error}</div>;
  if (!user) return null;

  const topSkills = [...skills].sort((a, b) => b.pct - a.pct).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Profile Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div
              className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center text-3xl font-bold text-white shadow-lg flex-shrink-0`}
            >
              {initials(user.fullName)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                  Nível {user.level}
                </span>
              </div>
              <p className="text-gray-400 mb-3">@{user.username}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Membro desde {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Zap, label: 'XP Total', value: user.xpTotal.toLocaleString('pt-BR'), color: 'text-yellow-400' },
              { icon: Flame, label: 'Sequência', value: `${user.streakCurrentDays} dias`, color: 'text-orange-400' },
              { icon: Code2, label: 'Skills', value: String(skills.length), color: 'text-blue-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-base font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Modo Foco */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Modo Foco</h2>
              <p className="text-sm text-gray-400">Oculta distrações e foca no roadmap</p>
            </div>
            <button
              role="switch"
              aria-checked={focusMode}
              onClick={() => setFocusMode(!focusMode)}
              className={`relative inline-flex w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                focusMode ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-1 ${
                  focusMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {focusMode && (
            <div className="mt-4 flex items-center gap-2 text-sm text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2.5">
              <Target className="w-4 h-4" />
              Modo Foco ativado — apenas o roadmap está visível
            </div>
          )}
        </section>

        {/* Identidade Visual */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Identidade Visual</h2>
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-400 mb-3">Cor do Avatar</p>
              <div className="flex gap-3">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedColor(opt.id)}
                    className={`w-9 h-9 rounded-full ${opt.class} transition-transform hover:scale-110 ${
                      selectedColor === opt.id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Nome de usuário</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">{bio.length}/160 caracteres</p>
            </div>

            {saveError && <p className="text-sm text-red-400">{saveError}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </div>
        </section>

        {/* Minhas Skills */}
        {skills.length > 0 && (
          <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Minhas Skills</h2>
              <span className="text-sm text-gray-500">{skills.length} habilidades</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm"
                >
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-xs opacity-70">· {skill.pct}%</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {topSkills.length > 0 && (
          <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Cartão Compartilhável</h2>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 w-full lg:w-72 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-lg font-bold text-white`}>
                  {initials(user.fullName)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{user.fullName}</p>
                  <p className="text-xs text-gray-400">Nível {user.level}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {topSkills.map((s) => (
                  <span key={s.name} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {s.name}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">XP Total</p>
                <p className="text-sm font-bold text-yellow-400">{user.xpTotal.toLocaleString('pt-BR')} XP</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
