import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GroupMatchCard } from './GroupMatchCard'
import { GroupMatch } from '@/types'

const mockMatch: GroupMatch = {
  id: 'm-1',
  groupId: 'g-1',
  homeTeamId: 't1',
  awayTeamId: 't2',
  homeTeam: 'Brazil',
  homeCode: 'BRA',
  awayTeam: 'Argentina',
  awayCode: 'ARG',
  homeScore: 0,
  awayScore: 0,
  winnerId: null,
  status: 'pending',
  phase: 'group_stage',
}

describe('GroupMatchCard', () => {
  it('renders team names and codes', () => {
    render(<GroupMatchCard match={mockMatch} onSave={async () => {}} />)
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('BRA')).toBeInTheDocument()
    expect(screen.getByText('ARG')).toBeInTheDocument()
  })

  it('calls onSave when score changes', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<GroupMatchCard match={mockMatch} onSave={onSave} />)
    const plusButtons = screen.getAllByText('+')
    fireEvent.click(plusButtons[0])
    await vi.waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('m-1', { homeScore: 1, awayScore: 0 })
    })
  })

  it('syncs scores when match prop changes', () => {
    const { rerender } = render(<GroupMatchCard match={mockMatch} onSave={async () => {}} />)
    expect(screen.getAllByText('0')).toHaveLength(2)
    const updatedMatch = { ...mockMatch, homeScore: 2, awayScore: 1 }
    rerender(<GroupMatchCard match={updatedMatch} onSave={async () => {}} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
