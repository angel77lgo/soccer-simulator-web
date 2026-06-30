import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BracketNode } from './BracketNode'
import { BracketMatch } from '@/types'

const mockMatch: BracketMatch = {
  id: 'br-1',
  homeTeam: 'Brazil',
  homeCode: 'BRA',
  awayTeam: 'Argentina',
  awayCode: 'ARG',
  homeScore: 0,
  awayScore: 0,
  home_extra: 0,
  away_extra: 0,
  home_pen: 0,
  away_pen: 0,
  winnerId: '',
  status: 'pending',
  bracket_position: 1,
}

describe('BracketNode', () => {
  it('renders team names and TBD for empty', () => {
    render(<BracketNode match={mockMatch} onSave={async () => {}} />)
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
  })

  it('renders TBD when team name is empty', () => {
    const emptyMatch = { ...mockMatch, homeTeam: '', awayTeam: '' }
    render(<BracketNode match={emptyMatch} onSave={async () => {}} />)
    expect(screen.getAllByText('TBD').length).toBe(2)
  })

  it('calls onSave with extra and penalty data when score changes', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const matchWithExtra: BracketMatch = {
      ...mockMatch,
      home_extra: 1,
      away_extra: 0,
      home_pen: 4,
      away_pen: 2,
    }
    render(<BracketNode match={matchWithExtra} onSave={onSave} />)
    const plusButtons = screen.getAllByText('+')
    fireEvent.click(plusButtons[0])
    await vi.waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('br-1', {
        homeScore: 1,
        awayScore: 0,
        homeExtraScore: 1,
        awayExtraScore: 0,
        homePenaltyScore: 4,
        awayPenaltyScore: 2,
      })
    })
  })

  it('applies winner font-semibold style when finished', () => {
    const finishedMatch = { ...mockMatch, homeScore: 3, awayScore: 1, winnerId: 't1', status: 'finished' }
    render(<BracketNode match={finishedMatch} onSave={async () => {}} />)
    const brazilSpan = screen.getByText('Brazil')
    expect(brazilSpan.className).toContain('font-semibold')
    const argSpan = screen.getByText('Argentina')
    expect(argSpan.className).not.toContain('font-semibold')
  })
})
