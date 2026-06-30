import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WizardStep6Confirm } from './WizardStep6Confirm'
import { Team } from '@/types'

const mockHosts: Team[] = [
  { id: 'h1', name: 'USA', shortName: 'USA', fifaCode: 'USA', flagUrl: '', confederationId: 'c1', confederation: { id: 'c1', name: 'CONCACAF', code: 'CONCACAF' }, fifaRanking: 10 },
]

const mockParticipants: Team[] = [
  { id: 'p1', name: 'Brazil', shortName: 'BRA', fifaCode: 'BRA', flagUrl: '', confederationId: 'c2', confederation: { id: 'c2', name: 'CONMEBOL', code: 'CONMEBOL' }, fifaRanking: 1 },
  { id: 'p2', name: 'Spain', shortName: 'ESP', fifaCode: 'ESP', flagUrl: '', confederationId: 'c3', confederation: { id: 'c3', name: 'UEFA', code: 'UEFA' }, fifaRanking: 3 },
]

const allTeams = [...mockHosts, ...mockParticipants]

const defaultProps = {
  name: 'World Cup 2026',
  type: 'official' as const,
  subType: 'world_cup',
  templates: { world_cup: { name: 'World Cup', teamsCount: 32, quotas: {} } },
  totalTeamsExpected: 32,
  hostIds: ['h1'],
  hostTeams: mockHosts,
  selectedTeamIds: ['p1', 'p2'],
  repechajeTeamIds: [] as string[],
  availableTeams: allTeams,
}

describe('WizardStep6Confirm', () => {
  it('renders tournament name and format', () => {
    render(<WizardStep6Confirm {...defaultProps} />)
    expect(screen.getByText('World Cup 2026')).toBeInTheDocument()
    expect(screen.getByText('World Cup')).toBeInTheDocument()
  })

  it('shows total teams', () => {
    render(<WizardStep6Confirm {...defaultProps} />)
    expect(screen.getByText('32 selecciones')).toBeInTheDocument()
  })

  it('shows hosts section when hosts are present', () => {
    render(<WizardStep6Confirm {...defaultProps} />)
    expect(screen.getByText('Países Anfitriones (1)')).toBeInTheDocument()
    expect(screen.getByText('USA (USA)')).toBeInTheDocument()
  })

  it('shows participants', () => {
    render(<WizardStep6Confirm {...defaultProps} />)
    expect(screen.getByText('Brazil (BRA)')).toBeInTheDocument()
    expect(screen.getByText('Spain (ESP)')).toBeInTheDocument()
  })

  it('shows repechaje count', () => {
    render(<WizardStep6Confirm {...defaultProps} />)
    expect(screen.getByText(/2 base \+ 0 repechaje/)).toBeInTheDocument()
  })
})
