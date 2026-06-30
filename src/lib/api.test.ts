import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('axios', () => {
  const mockAxios: any = () => mockInstance
  mockAxios.create = vi.fn(() => mockInstance)
  mockAxios.get = vi.fn()
  mockAxios.post = vi.fn()
  mockAxios.delete = vi.fn()
  return { default: mockAxios }
})

import {
  getTeams,
  getTournaments,
  getTemplates,
  createTournament,
  simulateMatch,
  getTournamentStatus,
  getTournamentStandings,
  getTournamentBracket,
  generateGroupMatches,
  simulateGroupStage,
  generateKnockoutBracket,
  simulateKnockoutRound,
  getTournamentGroupMatches,
  deleteTournament,
  updateMatchScore,
} from './api'

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getTeams calls GET /teams', async () => {
    mockInstance.get.mockResolvedValue({ data: [{ id: '1' }] })
    const result = await getTeams()
    expect(mockInstance.get).toHaveBeenCalledWith('/teams')
    expect(result).toEqual([{ id: '1' }])
  })

  it('getTournaments calls GET /tournaments', async () => {
    mockInstance.get.mockResolvedValue({ data: [{ id: '1' }] })
    const result = await getTournaments()
    expect(mockInstance.get).toHaveBeenCalledWith('/tournaments')
    expect(result).toEqual([{ id: '1' }])
  })

  it('getTemplates calls GET /tournaments/templates', async () => {
    mockInstance.get.mockResolvedValue({ data: { world_cup: {} } })
    const result = await getTemplates()
    expect(mockInstance.get).toHaveBeenCalledWith('/tournaments/templates')
    expect(result).toEqual({ world_cup: {} })
  })

  it('createTournament calls POST /tournaments', async () => {
    const payload = { name: 'Test', teamIds: [] }
    mockInstance.post.mockResolvedValue({ data: { id: '1' } })
    const result = await createTournament(payload)
    expect(mockInstance.post).toHaveBeenCalledWith('/tournaments', payload)
    expect(result).toEqual({ id: '1' })
  })

  it('simulateMatch calls POST /simulation/simulate', async () => {
    mockInstance.post.mockResolvedValue({ data: { result: 'home' } })
    const result = await simulateMatch('h1', 'a1')
    expect(mockInstance.post).toHaveBeenCalledWith('/simulation/simulate?homeId=h1&awayId=a1')
    expect(result).toEqual({ result: 'home' })
  })

  it('getTournamentStatus calls GET /tournaments/:id/status', async () => {
    mockInstance.get.mockResolvedValue({ data: { status: 'active' } })
    const result = await getTournamentStatus('t-1')
    expect(mockInstance.get).toHaveBeenCalledWith('/tournaments/t-1/status')
    expect(result).toEqual({ status: 'active' })
  })

  it('getTournamentStandings calls GET /tournaments/:id/standings', async () => {
    mockInstance.get.mockResolvedValue({ data: [] })
    const result = await getTournamentStandings('t-1')
    expect(mockInstance.get).toHaveBeenCalledWith('/tournaments/t-1/standings')
    expect(result).toEqual([])
  })

  it('getTournamentBracket calls GET /tournaments/:id/bracket', async () => {
    mockInstance.get.mockResolvedValue({ data: { rounds: [] } })
    const result = await getTournamentBracket('t-1')
    expect(mockInstance.get).toHaveBeenCalledWith('/tournaments/t-1/bracket')
    expect(result).toEqual({ rounds: [] })
  })

  it('generateGroupMatches calls POST /tournaments/:id/generate-matches', async () => {
    mockInstance.post.mockResolvedValue({ data: { success: true } })
    const result = await generateGroupMatches('t-1')
    expect(mockInstance.post).toHaveBeenCalledWith('/tournaments/t-1/generate-matches')
    expect(result).toEqual({ success: true })
  })

  it('simulateGroupStage calls POST /tournaments/:id/simulate-groups', async () => {
    mockInstance.post.mockResolvedValue({ data: { success: true } })
    const result = await simulateGroupStage('t-1')
    expect(mockInstance.post).toHaveBeenCalledWith('/tournaments/t-1/simulate-groups')
    expect(result).toEqual({ success: true })
  })

  it('generateKnockoutBracket calls POST /tournaments/:id/generate-knockout', async () => {
    mockInstance.post.mockResolvedValue({ data: { bracket: [] } })
    const result = await generateKnockoutBracket('t-1')
    expect(mockInstance.post).toHaveBeenCalledWith('/tournaments/t-1/generate-knockout')
    expect(result).toEqual({ bracket: [] })
  })

  it('simulateKnockoutRound calls POST /tournaments/:id/simulate-knockout/:phase', async () => {
    mockInstance.post.mockResolvedValue({ data: { phase: 'quarter' } })
    const result = await simulateKnockoutRound('t-1', 'quarter')
    expect(mockInstance.post).toHaveBeenCalledWith('/tournaments/t-1/simulate-knockout/quarter')
    expect(result).toEqual({ phase: 'quarter' })
  })

  it('getTournamentGroupMatches calls GET /tournaments/:id/group-matches', async () => {
    mockInstance.get.mockResolvedValue({ data: [] })
    const result = await getTournamentGroupMatches('t-1')
    expect(mockInstance.get).toHaveBeenCalledWith('/tournaments/t-1/group-matches')
    expect(result).toEqual([])
  })

  it('deleteTournament calls DELETE /tournaments/:id', async () => {
    mockInstance.delete.mockResolvedValue({ data: { success: true } })
    const result = await deleteTournament('t-1')
    expect(mockInstance.delete).toHaveBeenCalledWith('/tournaments/t-1')
    expect(result).toEqual({ success: true })
  })

  it('updateMatchScore calls POST /tournaments/matches/:matchId', async () => {
    const payload = { homeScore: 2, awayScore: 1 }
    mockInstance.post.mockResolvedValue({ data: { id: 'm-1' } })
    const result = await updateMatchScore('m-1', payload)
    expect(mockInstance.post).toHaveBeenCalledWith('/tournaments/matches/m-1', payload)
    expect(result).toEqual({ id: 'm-1' })
  })
})
