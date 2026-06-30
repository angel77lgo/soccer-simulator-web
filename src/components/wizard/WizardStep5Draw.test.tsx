import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardStep5Draw } from './WizardStep5Draw'
import { Team } from '@/types'

const mockTeams: Team[] = [
  { id: 't1', name: 'Brazil', shortName: 'BRA', fifaCode: 'BRA', flagUrl: '', confederationId: 'c1', confederation: { id: 'c1', name: 'CONMEBOL', code: 'CONMEBOL' }, fifaRanking: 1 },
  { id: 't2', name: 'Argentina', shortName: 'ARG', fifaCode: 'ARG', flagUrl: '', confederationId: 'c1', confederation: { id: 'c1', name: 'CONMEBOL', code: 'CONMEBOL' }, fifaRanking: 2 },
]

const defaultProps = {
  drawMode: 'auto' as const,
  setDrawMode: vi.fn(),
  assignedTeamIds: new Set<string>(),
  totalTeamsExpected: 32,
  dropError: null,
  setDropError: vi.fn(),
  pots: [[mockTeams[0]], [mockTeams[1]], [], []] as Team[][],
  numGroups: 8,
  manualGroups: {} as Record<number, string[]>,
  availableTeams: mockTeams,
  activeDragTeamId: null,
  activeDragTeam: null as Team | null,
  shakingSlotId: null,
  shakeCounter: 0,
  getAssignedGroupName: vi.fn(() => undefined),
  getSlotInvalidity: vi.fn(() => ({ invalid: false })),
  removeFromGroup: vi.fn(),
  handleDragStart: vi.fn(),
  handleDragCancel: vi.fn(),
  handleDragEnd: vi.fn(),
  sensors: [] as any,
}

describe('WizardStep5Draw', () => {
  it('renders auto mode message', () => {
    render(<WizardStep5Draw {...defaultProps} />)
    expect(screen.getByText('Sorteo Automático Activado')).toBeInTheDocument()
  })

  it('shows manual mode when drawMode is manual', () => {
    render(<WizardStep5Draw {...defaultProps} drawMode="manual" />)
    expect(screen.getByText('Sorteo Manual:')).toBeInTheDocument()
  })

  it('calls setDrawMode when clicking buttons', () => {
    const setDrawMode = vi.fn()
    render(<WizardStep5Draw {...defaultProps} setDrawMode={setDrawMode} />)
    fireEvent.click(screen.getByText('Manual'))
    expect(setDrawMode).toHaveBeenCalledWith('manual')
  })

  it('shows assigned count', () => {
    render(<WizardStep5Draw {...defaultProps} drawMode="manual" />)
    expect(screen.getByText(/0 \/ 32 asignados/)).toBeInTheDocument()
  })

  it('shows drop error when provided', () => {
    render(<WizardStep5Draw {...defaultProps} drawMode="manual" dropError="Error message" />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('dismisses drop error on X click', () => {
    const setDropError = vi.fn()
    render(<WizardStep5Draw {...defaultProps} drawMode="manual" dropError="Some error" setDropError={setDropError} />)
    fireEvent.click(screen.getByLabelText('Cerrar mensaje'))
    expect(setDropError).toHaveBeenCalledWith(null)
  })
})
