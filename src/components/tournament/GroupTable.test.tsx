import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GroupTable } from './GroupTable'
import { StandingRow } from '@/types'

const mockStandings: StandingRow[] = [
  { position: 1, teamId: 't1', teamName: 'Brazil', teamCode: 'BRA', played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 10, goalsAgainst: 1, goalDiff: 9, points: 9 },
  { position: 2, teamId: 't2', teamName: 'Argentina', teamCode: 'ARG', played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 4, goalDiff: -1, points: 4 },
  { position: 3, teamId: 't3', teamName: 'Spain', teamCode: 'ESP', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 2, goalsAgainst: 5, goalDiff: -3, points: 3 },
]

describe('GroupTable', () => {
  it('renders all standings rows', () => {
    render(<GroupTable standings={mockStandings} />)
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('Spain')).toBeInTheDocument()
  })

  it('shows goal details when showGoalsDetails is true', () => {
    render(<GroupTable standings={mockStandings} showGoalsDetails />)
    expect(screen.getByText('GF')).toBeInTheDocument()
    expect(screen.getByText('GA')).toBeInTheDocument()
  })

  it('does not show goal details when showGoalsDetails is false', () => {
    render(<GroupTable standings={mockStandings} />)
    expect(screen.queryByText('GF')).not.toBeInTheDocument()
  })

  it('applies font-semibold for champion code', () => {
    render(<GroupTable standings={mockStandings} championCode="BRA" />)
    const brazilSpan = screen.getByText('Brazil')
    expect(brazilSpan.className).toContain('font-semibold')
  })

  it('renders correct stats values', () => {
    render(<GroupTable standings={mockStandings} />)
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('+9')).toBeInTheDocument()
    expect(screen.getByText('-1')).toBeInTheDocument()
    expect(screen.getByText('-3')).toBeInTheDocument()
  })
})
