import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardStep1General } from './WizardStep1General'

const defaultProps = {
  name: '',
  setName: vi.fn(),
  entityType: 'national' as const,
  setEntityType: vi.fn(),
  type: 'official' as const,
  setType: vi.fn(),
  subType: 'world_cup',
  setSubType: vi.fn(),
  teamsCount: 32 as const,
  setTeamsCount: vi.fn(),
  customQuotas: { UEFA: 10, CONMEBOL: 6, CONCACAF: 4, CAF: 6, AFC: 5, OFC: 1 },
  setCustomQuotas: vi.fn(),
  templates: {
    world_cup: { name: 'World Cup', teamsCount: 32, quotas: { UEFA: 13, CONMEBOL: 6, CONCACAF: 6, CAF: 4, AFC: 2, OFC: 1 } },
  },
  customQuotasSum: 32,
  isCustomQuotaValid: true,
  setSelectedTeamIds: vi.fn(),
  setHostIds: vi.fn(),
  setRepechajeTeamIds: vi.fn(),
}

describe('WizardStep1General', () => {
  it('renders tournament name input', () => {
    render(<WizardStep1General {...defaultProps} />)
    const input = screen.getByPlaceholderText(/ej/i) as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('calls setName when input changes', () => {
    const setName = vi.fn()
    render(<WizardStep1General {...defaultProps} setName={setName} />)
    const input = screen.getByPlaceholderText(/ej/i)
    fireEvent.change(input, { target: { value: 'My Tournament' } })
    expect(setName).toHaveBeenCalledWith('My Tournament')
  })

  it('calls setEntityType when category select changes', () => {
    const setEntityType = vi.fn()
    render(<WizardStep1General {...defaultProps} setEntityType={setEntityType} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'club' } })
    expect(setEntityType).toHaveBeenCalledWith('club')
  })

  it('calls setType when type select changes', () => {
    const setType = vi.fn()
    render(<WizardStep1General {...defaultProps} setType={setType} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: 'custom' } })
    expect(setType).toHaveBeenCalledWith('custom')
  })

  it('shows template select when type is official', () => {
    render(<WizardStep1General {...defaultProps} />)
    expect(screen.getByText(/World Cup.*32 equipos/)).toBeInTheDocument()
  })
})
