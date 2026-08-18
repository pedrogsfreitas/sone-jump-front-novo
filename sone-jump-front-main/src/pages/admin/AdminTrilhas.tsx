import { useState } from 'react'
import {
  Plus,
  BookOpen,
  Layers,
  Users,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'

interface Module {
  id: number
  title: string
  duration: string
  lessons: number
}

interface Trail {
  id: number
  name: string
  category: string
  modules: number
  enrolled: number
  completion: number
  active: boolean
  color: string
  moduleList: Module[]
}

const trails: Trail[] = [
  {
    id: 1,
    name: 'Frontend do Zero ao Avançado',
    category: 'Frontend',
    modules: 12,
    enrolled: 3840,
    completion: 67,
    active: true,
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    moduleList: [
      { id: 1, title: 'Introdução ao HTML5', duration: '2h 30min', lessons: 8 },
      { id: 2, title: 'CSS Moderno e Flexbox', duration: '3h 15min', lessons: 12 },
      { id: 3, title: 'JavaScript Essencial', duration: '5h 00min', lessons: 20 },
      { id: 4, title: 'React do Zero', duration: '6h 45min', lessons: 24 },
    ],
  },
  {
    id: 2,
    name: 'Backend com Node.js',
    category: 'Backend',
    modules: 10,
    enrolled: 2310,
    completion: 54,
    active: true,
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    moduleList: [
      { id: 1, title: 'Node.js Fundamentals', duration: '3h 00min', lessons: 10 },
      { id: 2, title: 'APIs RESTful com Express', duration: '4h 30min', lessons: 16 },
      { id: 3, title: 'Banco de Dados com PostgreSQL', duration: '4h 00min', lessons: 14 },
    ],
  },
  {
    id: 3,
    name: 'Full Stack React + Node',
    category: 'Full Stack',
    modules: 15,
    enrolled: 1940,
    completion: 41,
    active: true,
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    moduleList: [
      { id: 1, title: 'Setup do Ambiente', duration: '1h 00min', lessons: 4 },
      { id: 2, title: 'Frontend com React', duration: '6h 00min', lessons: 22 },
      { id: 3, title: 'Backend com Node', duration: '5h 00min', lessons: 18 },
      { id: 4, title: 'Integração e Deploy', duration: '3h 30min', lessons: 12 },
    ],
  },
  {
    id: 4,
    name: 'DevOps para Desenvolvedores',
    category: 'DevOps',
    modules: 8,
    enrolled: 987,
    completion: 38,
    active: true,
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    moduleList: [
      { id: 1, title: 'Linux e Command Line', duration: '2h 00min', lessons: 8 },
      { id: 2, title: 'Docker e Containers', duration: '3h 30min', lessons: 14 },
      { id: 3, title: 'CI/CD com GitHub Actions', duration: '2h 30min', lessons: 10 },
    ],
  },
  {
    id: 5,
    name: 'Introdução à Data Science',
    category: 'Data',
    modules: 9,
    enrolled: 642,
    completion: 29,
    active: false,
    color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    moduleList: [
      { id: 1, title: 'Python para Dados', duration: '3h 00min', lessons: 12 },
      { id: 2, title: 'Pandas e NumPy', duration: '4h 00min', lessons: 16 },
    ],
  },
]

export default function AdminTrilhas() {
  const [trailList, setTrailList] = useState(trails)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const toggleActive = (id: number) => {
    setTrailList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    )
  }

  const toggleExpand = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id))
  }

  const totals = {
    ativas: trailList.filter((t) => t.active).length,
    modulos: trailList.reduce((s, t) => s + t.modules, 0),
    alunos: trailList.reduce((s, t) => s + t.enrolled, 0),
    conclusao: Math.round(trailList.reduce((s, t) => s + t.completion, 0) / trailList.length),
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciar Trilhas</h1>
            <p className="text-sm text-gray-500 mt-1">Crie e gerencie trilhas de aprendizado</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-purple-500/20">
            <Plus className="w-4 h-4" /> Nova Trilha
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: 'Trilhas Ativas', value: totals.ativas, color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: Layers, label: 'Módulos Totais', value: totals.modulos, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Users, label: 'Alunos Matriculados', value: totals.alunos.toLocaleString('pt-BR'), color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: CheckCircle, label: 'Taxa de Conclusão', value: `${totals.conclusao}%`, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="w-8" />
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trilha</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Categoria</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Módulos</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Matriculados</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Conclusão</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {trailList.map((trail) => (
                  <>
                    <tr
                      key={trail.id}
                      className="border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(trail.id)}
                    >
                      <td className="py-4 pl-4">
                        {expandedRow === trail.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-200">{trail.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${trail.color}`}>
                          {trail.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-400">{trail.modules}</td>
                      <td className="py-4 px-4 text-center text-sm text-gray-400">{trail.enrolled.toLocaleString('pt-BR')}</td>
                      <td className="py-4 px-4 min-w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${trail.completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{trail.completion}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleActive(trail.id)}
                            className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                              trail.active ? 'bg-green-600' : 'bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 mt-1 ${
                                trail.active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-blue-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-yellow-400 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Module Row */}
                    {expandedRow === trail.id && (
                      <tr key={`${trail.id}-modules`}>
                        <td colSpan={8} className="bg-gray-800/40 border-b border-gray-800/60 px-6 py-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Módulos da trilha
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {trail.moduleList.map((mod) => (
                              <div
                                key={mod.id}
                                className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3"
                              >
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold flex-shrink-0">
                                  {mod.id}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-200 truncate">{mod.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {mod.lessons} aulas · {mod.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
