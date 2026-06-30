import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWizardState } from './useWizardState'
import { Team } from '@/types'

const mockTeams: Team[] = [
  { id: 't1', name: 'Brazil', shortName: 'BRA', fifaCode: 'BRA', flagUrl: '', confederationId: 'c1', confederation: { id: 'c1', name: 'CONMEBOL', code: 'CONMEBOL' }, fifaRanking: 1 },
  { id: 't2', name: 'Argentina', shortName: 'ARG', fifaCode: 'ARG', flagUrl: '', confederationId: 'c1', confederation: { id: 'c1', name: 'CONMEBOL', code: 'CONMEBOL' }, fifaRanking: 2 },
  { id: 't3', name: 'Spain', shortName: 'ESP', fifaCode: 'ESP', flagUrl: '', confederationId: 'c2', confederation: { id: 'c2', name: 'UEFA', code: 'UEFA' }, fifaRanking: 3 },
  { id: 't4', name: 'Germany', shortName: 'GER', fifaCode: 'GER', flagUrl: '', confederationId: 'c2', confederation: { id: 'c2', name: 'UEFA', code: 'UEFA' }, fifaRanking: 4 },
  { id: 't5', name: 'France', shortName: 'FRA', fifaCode: 'FRA', flagUrl: '', confederationId: 'c2', confederation: { id: 'c2', name: 'UEFA', code: 'UEFA' }, fifaRanking: 5 },
  { id: 't6', name: 'Mexico', shortName: 'MEX', fifaCode: 'MEX', flagUrl: '', confederationId: 'c3', confederation: { id: 'c3', name: 'CONCACAF', code: 'CONCACAF' }, fifaRanking: 10 },
  { id: 't7', name: 'USA', shortName: 'USA', fifaCode: 'USA', flagUrl: '', confederationId: 'c3', confederation: { id: 'c3', name: 'CONCACAF', code: 'CONCACAF' }, fifaRanking: 11 },
]

const mockTemplates = {
  world_cup: { name: 'World Cup', teamsCount: 32, quotas: { UEFA: 13, CONMEBOL: 6, CONCACAF: 6, CAF: 4, AFC: 2, OFC: 1 } },
}

const mockRouterPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

vi.mock('@/lib/api', () => ({
  getTeams: vi.fn(() => Promise.resolve(mockTeams)),
  getTemplates: vi.fn(() => Promise.resolve(mockTemplates)),
  createTournament: vi.fn(() => Promise.resolve({ id: 'new-tournament-1' })),
}))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('useWizardState', () => {
  it('initializes with default values', async () => {
    const { result } = renderHook(() => useWizardState())

    expect(result.current.step).toBe(1)
    expect(result.current.name).toBe('')
    expect(result.current.type).toBe('official')
    expect(result.current.teamsCount).toBe(32)
    expect(result.current.hostIds).toEqual([])
    expect(result.current.selectedTeamIds).toEqual([])
    expect(result.current.repechajeTeamIds).toEqual([])
    expect(result.current.drawMode).toBe('auto')
    expect(result.current.manualGroups).toEqual({})
  })

  it('loads templates and teams on mount', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.templates).toEqual(mockTemplates)
      expect(result.current.availableTeams).toEqual(mockTeams)
    })
  })

  it('sets name correctly', async () => {
    const { result } = renderHook(() => useWizardState())
    await act(async () => {
      result.current.setName('Copa del Mundo')
    })
    expect(result.current.name).toBe('Copa del Mundo')
  })

  it('handles next and prev steps', async () => {
    const { result } = renderHook(() => useWizardState())
    act(() => { result.current.handleNext() })
    expect(result.current.step).toBe(2)
    act(() => { result.current.handleNext() })
    expect(result.current.step).toBe(3)
    act(() => { result.current.handlePrev() })
    expect(result.current.step).toBe(2)
    act(() => { result.current.handlePrev() })
    expect(result.current.step).toBe(1)
    act(() => { result.current.handlePrev() })
    expect(result.current.step).toBe(1)
  })

  it('sets type to custom', async () => {
    const { result } = renderHook(() => useWizardState())
    await act(async () => { result.current.setType('custom') })
    expect(result.current.type).toBe('custom')
  })

  it('sets teamsCount after templates load', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(Object.keys(result.current.templates).length).toBeGreaterThan(0)
    })
    await act(async () => { result.current.setTeamsCount(48) })
    expect(result.current.teamsCount).toBe(48)
  })

  it('toggleHost adds and removes hosts', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.toggleHost('t1') })
    expect(result.current.hostIds).toEqual(['t1'])
    act(() => { result.current.toggleHost('t1') })
    expect(result.current.hostIds).toEqual([])
    act(() => { result.current.toggleHost('t2') })
    expect(result.current.hostIds).toEqual(['t2'])
  })

  it('toggleParticipant respects quotas', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.setType('custom') })
    act(() => { result.current.setTeamsCount(16) })
    act(() => {
      result.current.setCustomQuotas({
        UEFA: 2, CONMEBOL: 1, CONCACAF: 0, CAF: 0, AFC: 0, OFC: 0,
      })
    })
    act(() => { result.current.toggleParticipant('t3', 'UEFA') })
    expect(result.current.selectedTeamIds).toContain('t3')
    act(() => { result.current.toggleParticipant('t4', 'UEFA') })
    expect(result.current.selectedTeamIds).toContain('t4')
    act(() => { result.current.toggleParticipant('t5', 'UEFA') })
    expect(result.current.selectedTeamIds).not.toContain('t5')
  })

  it('toggleRepechaje respects freedSlots', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    expect(result.current.freedSlots).toBe(0)
    act(() => { result.current.toggleRepechaje('t6') })
    expect(result.current.repechajeTeamIds).toEqual([])
  })

  it('assignedTeamIds reflects manual groups', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.setManualGroups({ 0: ['t1', 't3', '', ''], 1: ['t2', 't4', '', ''] }) })
    expect(result.current.assignedTeamIds).toEqual(new Set(['t1', 't2', 't3', 't4']))
  })

  it('isStep1Valid requires non-empty name', async () => {
    const { result } = renderHook(() => useWizardState())
    expect(result.current.isStep1Valid).toBe(false)
    act(() => { result.current.setName('Test') })
    expect(result.current.isStep1Valid).toBe(true)
  })

  it('isStep5Valid checks manual groups completeness', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.setDrawMode('manual') })
    expect(result.current.isStep5Valid).toBe(false)
  })

  it('getAssignedGroupName returns group name for assigned team', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.setManualGroups({ 0: ['t1', '', '', ''] }) })
    expect(result.current.getAssignedGroupName('t1')).toBe('Grupo A')
    expect(result.current.getAssignedGroupName('t2')).toBeUndefined()
  })

  it('getSelectedCountPerConfed counts correctly', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.setType('custom') })
    act(() => { result.current.setTeamsCount(16) })
    act(() => {
      result.current.setCustomQuotas({
        UEFA: 2, CONMEBOL: 2, CONCACAF: 0, CAF: 0, AFC: 0, OFC: 0,
      })
    })
    act(() => { result.current.toggleParticipant('t3', 'UEFA') })
    act(() => { result.current.toggleParticipant('t4', 'UEFA') })
    act(() => { result.current.toggleParticipant('t1', 'CONMEBOL') })
    expect(result.current.getSelectedCountPerConfed('UEFA')).toBe(2)
    expect(result.current.getSelectedCountPerConfed('CONMEBOL')).toBe(1)
    expect(result.current.getSelectedCountPerConfed('CONCACAF')).toBe(0)
  })

  it('removeFromGroup clears the slot', async () => {
    const { result } = renderHook(() => useWizardState())
    act(() => { result.current.setManualGroups({ 0: ['t1', 't3', '', ''] }) })
    act(() => { result.current.removeFromGroup(0, 0) })
    expect(result.current.manualGroups[0]?.[0]).toBe('')
  })

  it('getSlotInvalidity detects occupied slot', async () => {
    const { result } = renderHook(() => useWizardState())
    act(() => { result.current.setManualGroups({ 0: ['t1', '', '', ''] }) })
    const invalidity = result.current.getSlotInvalidity(0, 0, 't2')
    expect(invalidity.invalid).toBe(true)
    expect(invalidity.reason).toBe('occupied')
  })

  it('getSlotInvalidity returns not invalid for same team on slot', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.setType('custom') })
    act(() => { result.current.setTeamsCount(4) })
    act(() => {
      result.current.setCustomQuotas({ UEFA: 1, CONMEBOL: 1, CONCACAF: 0, CAF: 0, AFC: 0, OFC: 0 })
    })
    await act(async () => { result.current.toggleParticipant('t1', 'CONMEBOL') })
    await act(async () => { result.current.toggleParticipant('t3', 'UEFA') })
    await act(async () => {
      result.current.setManualGroups({ 0: ['t1', '', '', ''] })
    })
    const invalidity = result.current.getSlotInvalidity(0, 0, 't1')
    expect(invalidity.invalid).toBe(false)
  })

  it('handleDragEnd with over on pot unassigns from group', async () => {
    const { result } = renderHook(() => useWizardState())
    act(() => { result.current.setManualGroups({ 0: ['t1', '', '', ''] }) })
    act(() => {
      result.current.handleDragEnd({
        active: { id: 't1' } as any,
        over: { id: 'pot-0' } as any,
      } as any)
    })
    expect(result.current.manualGroups[0]?.[0]).toBe('')
  })

  it('randomizeConfederation selects exact quota non-host teams', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
    })
    act(() => { result.current.setType('custom') })
    act(() => { result.current.setTeamsCount(16) })
    act(() => {
      result.current.setCustomQuotas({
        UEFA: 2, CONMEBOL: 2, CONCACAF: 0, CAF: 0, AFC: 0, OFC: 0,
      })
    })
    act(() => { result.current.randomizeConfederation('UEFA') })
    const uefaSelected = result.current.selectedTeamIds.filter(id =>
      mockTeams.find(t => t.id === id)?.confederation?.code === 'UEFA'
    )
    expect(uefaSelected.length).toBe(2)
  })

  it('getSlotInvalidity catches invalid drop in World Cup', async () => {
    const { result } = renderHook(() => useWizardState())
    await vi.waitFor(() => {
      expect(result.current.availableTeams.length).toBeGreaterThan(0)
      expect(result.current.templates).toEqual(mockTemplates)
    })
    expect(result.current.isWorldCup).toBe(true)
    act(() => { result.current.setManualGroups({ 0: ['t3', 't4', '', ''] }) })
    const invalidity = result.current.getSlotInvalidity(0, 2, 't5')
    expect(invalidity.invalid).toBe(true)
    // Pot check runs before confed check, so 'pot' is also valid
    expect(['pot', 'confed']).toContain(invalidity.reason)
  })
})
