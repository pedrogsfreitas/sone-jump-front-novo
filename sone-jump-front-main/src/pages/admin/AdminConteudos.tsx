import { useState } from 'react'
import {
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Play,
  FileText,
  PlayCircle,
  ExternalLink,
  Star,
  MoreHorizontal,
} from 'lucide-react'

type ContentType = 'Video' | 'Artigo' | 'Quiz' | 'Projeto' | 'PDF'
type Platform = 'YouTube' | 'Interno' | 'Udemy' | 'GitHub' | 'Blog'
type ContentStatus = 'Publicado' | 'Rascunho' | 'Arquivado'

interface Content {
  id: number
  title: string
  type: ContentType
  platform: Platform
  duration: string
  views: number
  rating: number
  status: ContentStatus
}

const contents: Content[] = [
  { id: 1, title: 'HTML5 Semântico — Guia Completo', type: 'Video', platform: 'YouTube', duration: '42min', views: 8420, rating: 4.8, status: 'Publicado' },
  { id: 2, title: 'Como usar Flexbox no CSS', type: 'Video', platform: 'Interno', duration: '28min', views: 5640, rating: 4.7, status: 'Publicado' },
  { id: 3, title: 'JavaScript: Promises e Async/Await', type: 'Artigo', platform: 'Blog', duration: '12min', views: 3210, rating: 4.5, status: 'Publicado' },
  { id: 4, title: 'Quiz: Fundamentos de React', type: 'Quiz', platform: 'Interno', duration: '15min', views: 4890, rating: 4.6, status: 'Publicado' },
  { id: 5, title: 'Projeto: Todo App com React', type: 'Projeto', platform: 'GitHub', duration: '3h', views: 2340, rating: 4.9, status: 'Publicado' },
  { id: 6, title: 'TypeScript para Iniciantes', type: 'Video', platform: 'YouTube', duration: '1h 05min', views: 6780, rating: 4.7, status: 'Publicado' },
  { id: 7, title: 'REST APIs: Teoria e Prática', type: 'PDF', platform: 'Interno', duration: '—', views: 1230, rating: 4.3, status: 'Publicado' },
  { id: 8, title: 'Node.js Avançado com TypeScript', type: 'Video', platform: 'Udemy', duration: '2h 18min', views: 980, rating: 4.4, status: 'Rascunho' },
  { id: 9, title: 'Git Flow na Prática', type: 'Artigo', platform: 'Blog', duration: '8min', views: 2100, rating: 4.2, status: 'Publicado' },
  { id: 10, title: 'Docker Básico — Primeiros Passos', type: 'Video', platform: 'YouTube', duration: '35min', views: 1560, rating: 4.6, status: 'Rascunho' },
  { id: 11, title: 'Acessibilidade Web na Prática', type: 'Artigo', platform: 'Blog', duration: '10min', views: 870, rating: 4.1, status: 'Arquivado' },
]

const typeBadge: Record<ContentType, string> = {
  Video: 'bg-red-500/20 text-red-300 border-red-500/30',
  Artigo: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Quiz: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Projeto: 'bg-green-500/20 text-green-300 border-green-500/30',
  PDF: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

const typeIcon: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  Video: Play,
  Artigo: FileText,
  Quiz: Star,
  Projeto: ExternalLink,
  PDF: FileText,
}

const platformIcon: Record<Platform, React.ComponentType<{ className?: string }>> = {
  YouTube: PlayCircle,
  Interno: Play,
  Udemy: ExternalLink,
  GitHub: ExternalLink,
  Blog: FileText,
}

const statusBadge: Record<ContentStatus, string> = {
  Publicado: 'bg-green-500/20 text-green-300 border-green-500/30',
  Rascunho: 'bg-gray-700 text-gray-400 border-gray-600',
  Arquivado: 'bg-red-500/20 text-red-300 border-red-500/30',
}

export default function AdminConteudos() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'Todos' | ContentType>('Todos')
  const [platformFilter, setPlatformFilter] = useState<'Todos' | Platform>('Todos')

  const filtered = contents.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'Todos' || c.type === typeFilter
    const matchPlatform = platformFilter === 'Todos' || c.platform === platformFilter
    return matchSearch && matchType && matchPlatform
  })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciar Conteúdos</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie vídeos, artigos, quizzes e projetos</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-purple-500/20">
            <Upload className="w-4 h-4" /> Adicionar Conteúdo
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Conteúdos', value: contents.length, color: 'text-blue-400' },
            { label: 'Publicados', value: contents.filter((c) => c.status === 'Publicado').length, color: 'text-green-400' },
            { label: 'Rascunhos', value: contents.filter((c) => c.status === 'Rascunho').length, color: 'text-yellow-400' },
            { label: 'Total de Views', value: contents.reduce((s, c) => s + c.views, 0).toLocaleString('pt-BR'), color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="Todos">Todos os tipos</option>
              <option>Video</option>
              <option>Artigo</option>
              <option>Quiz</option>
              <option>Projeto</option>
              <option>PDF</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as typeof platformFilter)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="Todos">Todas as plataformas</option>
              <option>YouTube</option>
              <option>Interno</option>
              <option>Udemy</option>
              <option>GitHub</option>
              <option>Blog</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Título</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plataforma</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Duração</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Views</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Avaliação</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                      Nenhum conteúdo encontrado
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, i) => {
                    const TypeIcon = typeIcon[item.type]
                    const PlatformIcon = platformIcon[item.platform]
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors ${
                          i % 2 === 0 ? '' : 'bg-gray-900/40'
                        }`}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-200 font-medium max-w-xs truncate">{item.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeBadge[item.type]}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-400">
                            <PlatformIcon className="w-3.5 h-3.5" />
                            {item.platform}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-gray-400">{item.duration}</td>
                        <td className="py-4 px-4 text-center text-sm text-gray-300 font-medium">
                          {item.views.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-300">{item.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[item.status]}`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-blue-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-yellow-400 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 text-sm text-gray-500">
            {filtered.length} conteúdo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
