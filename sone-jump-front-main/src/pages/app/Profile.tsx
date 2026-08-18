import { useState } from 'react'
import {
  MapPin,
  Calendar,
  GitBranch as Github,
  ExternalLink as Linkedin,
  Globe as Twitter,
  Zap,
  Flame,
  Code2,
  Trophy,
  Download,
  Share2,
  Edit3,
  CheckCircle,
  BookOpen,
  Star,
  Award,
  Target,
} from 'lucide-react'

const colorOptions = [
  { id: 'purple', class: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
  { id: 'blue', class: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
  { id: 'green', class: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { id: 'orange', class: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { id: 'pink', class: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  { id: 'yellow', class: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
]

const skills = [
  { name: 'HTML/CSS', level: 'Avançado', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { name: 'JavaScript', level: 'Intermediário', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { name: 'React', level: 'Intermediário', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { name: 'TypeScript', level: 'Básico', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { name: 'Node.js', level: 'Básico', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { name: 'Git', level: 'Intermediário', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { name: 'Tailwind CSS', level: 'Avançado', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { name: 'SQL', level: 'Básico', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { name: 'Figma', level: 'Intermediário', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { name: 'REST APIs', level: 'Intermediário', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { name: 'Acessibilidade', level: 'Básico', color: 'bg-lime-500/20 text-lime-300 border-lime-500/30' },
  { name: 'Performance Web', level: 'Básico', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
]

const recentActivity = [
  {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    description: 'Completou o módulo "Hooks Avançados no React"',
    date: 'Hoje, 14:32',
  },
  {
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    description: 'Ganhou badge "JavaScript Ninja" após concluir 5 exercícios',
    date: 'Ontem, 09:15',
  },
  {
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    description: 'Iniciou a trilha "Desenvolvedor Full Stack"',
    date: '20 Jun, 18:00',
  },
  {
    icon: Award,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    description: 'Subiu para o Nível 8 — desbloqueou novos conteúdos',
    date: '18 Jun, 11:47',
  },
  {
    icon: Target,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    description: 'Atingiu sequência de 7 dias consecutivos de estudo',
    date: '17 Jun, 23:59',
  },
]

export default function Profile() {
  const [focusMode, setFocusMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState('purple')
  const [username, setUsername] = useState('joaosilva')
  const [bio, setBio] = useState(
    'Desenvolvedor frontend em formação, apaixonado por UI/UX e boas práticas de código. Buscando minha primeira oportunidade no mercado tech.'
  )
  const [linkCopied, setLinkCopied] = useState(false)

  const avatarColor = colorOptions.find((c) => c.id === selectedColor)?.class ?? colorOptions[0].class

  const handleCopyLink = () => {
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Profile Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div
              className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center text-3xl font-bold text-white shadow-lg flex-shrink-0`}
            >
              JS
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">João Silva</h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                  Nível 8
                </span>
              </div>
              <p className="text-gray-400 mb-3">Frontend Developer em formação</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> São Paulo, SP
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Membro desde Jan 2024
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: 'XP Total', value: '1.240', color: 'text-yellow-400' },
              { icon: Flame, label: 'Sequência', value: '7 dias', color: 'text-orange-400' },
              { icon: Code2, label: 'Skills', value: '12', color: 'text-blue-400' },
              { icon: Trophy, label: 'Ranking', value: '#34', color: 'text-purple-400' },
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

        {/* Cartão Compartilhável */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Cartão Compartilhável</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Card Preview */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 w-full lg:w-72 flex-shrink-0 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-lg font-bold text-white`}>
                  JS
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">João Silva</p>
                  <p className="text-xs text-gray-400">Nível 8 · #34 Ranking</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {['React', 'TypeScript', 'Tailwind'].map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">XP Total</p>
                  <p className="text-sm font-bold text-yellow-400">1.240 XP</p>
                </div>
                {/* QR Placeholder */}
                <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                  <div className="grid grid-cols-3 gap-0.5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-sm ${[0,2,4,6,8].includes(i) ? 'bg-gray-300' : 'bg-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 justify-center">
              <p className="text-sm text-gray-400">
                Compartilhe seu progresso com recrutadores e amigos. Seu cartão é atualizado automaticamente.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" /> Baixar Cartão
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700"
                >
                  <Share2 className="w-4 h-4" />
                  {linkCopied ? 'Link copiado!' : 'Compartilhar Link'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Identidade Visual */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Identidade Visual</h2>
          <div className="space-y-5">
            {/* Color Picker */}
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

            {/* Username */}
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

            {/* Bio */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">{bio.length}/160 caracteres</p>
            </div>

            <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
              Salvar Alterações
            </button>
          </div>
        </section>

        {/* Minhas Skills */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Minhas Skills</h2>
            <span className="text-sm text-gray-500">12 habilidades</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${skill.color}`}
              >
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs opacity-70">· {skill.level}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Atividade Recente */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Atividade Recente</h2>
          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">{item.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
