import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Goal, ProgressSummary, StudySession } from '../../services/progress/progress'
import Progress from './Progress'

const { getSummary, getSessions, getGoals, deleteGoal } = vi.hoisted(() => ({
  getSummary: vi.fn(),
  getSessions: vi.fn(),
  getGoals: vi.fn(),
  deleteGoal: vi.fn(),
}))

vi.mock('../../services/progress/progress', () => ({
  getSummary,
  getSessions,
  getGoals,
  deleteGoal,
  logSession: vi.fn(),
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
}))

const resumo: ProgressSummary = {
  xpTotal: 1234,
  level: 3,
  streakCurrentDays: 5,
  streakLongestDays: 9,
  sessionsThisWeek: 4,
  // Domingo … sábado
  sessionsByWeekday: [0, 2, 0, 1, 1, 0, 0],
  minutesThisMonth: 150,
  skills: [],
}

const sessao: StudySession = {
  id: 1,
  userId: 1,
  topic: 'Hooks do React',
  // Coluna só de data: o banco devolve meia-noite UTC.
  occurredOn: '2026-09-14T00:00:00.000Z',
  durationMinutes: 90,
  xpEarned: 90,
  subjectTag: 'React',
  createdAt: '2026-09-14T12:00:00.000Z',
}

const meta: Goal = {
  id: 7,
  userId: 1,
  title: 'Terminar o módulo de React',
  targetPct: 100,
  currentPct: 40,
  dueDate: '2026-10-01T00:00:00.000Z',
  completedAt: null,
  createdAt: '2026-09-01T12:00:00.000Z',
}

beforeEach(() => {
  getSummary.mockResolvedValue(resumo)
  getSessions.mockResolvedValue([sessao])
  getGoals.mockResolvedValue([meta])
  deleteGoal.mockResolvedValue(undefined)
})

describe('Progresso — números vindos do resumo do servidor', () => {
  /**
   * Antes, a tela somava as sessões carregadas (só as 50 mais recentes, de qualquer
   * mês) e agrupava por dia da semana no fuso local sobre uma data UTC. Os dois
   * números saíam errados; agora vêm prontos do back.
   */
  it('mostra as horas do mês que o back calculou', async () => {
    render(<Progress />)

    expect(await screen.findByText('2h 30min')).toBeInTheDocument()
  })

  it('mostra sequência e XP do resumo', async () => {
    render(<Progress />)

    expect(await screen.findByText('5 dias')).toBeInTheDocument()
    expect(screen.getByText('1.234')).toBeInTheDocument()
  })

  it('o gráfico da semana usa a contagem por dia do back', async () => {
    render(<Progress />)
    await screen.findByText('2h 30min')

    // Segunda tem 2 sessões no resumo; o rótulo aparece com a contagem ao lado.
    const segunda = screen.getByText('Seg').closest('div')
    expect(segunda).toHaveTextContent('2')
  })

  it('a data da sessão não volta um dia por causa do fuso', async () => {
    render(<Progress />)

    expect(await screen.findByText('14/09/2026')).toBeInTheDocument()
  })
})

describe('Progresso — apagar meta', () => {
  it('pede confirmação e não apaga quando a pessoa cancela', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<Progress />)
    await screen.findByText(meta.title)

    await userEvent.click(screen.getByTitle('Apagar meta'))

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteGoal).not.toHaveBeenCalled()
    expect(screen.getByText(meta.title)).toBeInTheDocument()
  })

  it('apaga e some da lista quando a pessoa confirma', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<Progress />)
    await screen.findByText(meta.title)

    await userEvent.click(screen.getByTitle('Apagar meta'))

    await waitFor(() => expect(deleteGoal).toHaveBeenCalledWith(meta.id))
    await waitFor(() => expect(screen.queryByText(meta.title)).not.toBeInTheDocument())
  })
})
