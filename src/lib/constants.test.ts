import { describe, it, expect } from 'vitest'
import {
  phaseLabels,
  phaseOrder,
  statusLabels,
  statusMeta,
  TOTAL_STEPS,
} from './constants'

describe('constants', () => {
  it('phaseLabels contains all expected phases', () => {
    expect(phaseLabels).toMatchObject({
      round_of_32: 'Round of 32',
      round_of_16: 'Round of 16',
      quarter: 'Quarter-finals',
      semi: 'Semi-finals',
      third_place: 'Third place',
      final: 'Final',
    })
  })

  it('phaseOrder has correct order', () => {
    expect(phaseOrder).toEqual([
      'round_of_32',
      'round_of_16',
      'quarter',
      'semi',
      'third_place',
      'final',
    ])
  })

  it('phaseOrder has no duplicates', () => {
    expect(new Set(phaseOrder).size).toBe(phaseOrder.length)
  })

  it('statusLabels contains all expected statuses', () => {
    expect(statusLabels).toMatchObject({
      pending: 'Draft',
      group_stage: 'Group stage',
      round_of_32: 'Round of 32',
      round_of_16: 'Round of 16',
      quarter: 'Quarter-finals',
      semi: 'Semi-finals',
      final: 'Final',
      finished: 'Finished',
    })
  })

  it('statusMeta has label for each status', () => {
    for (const [key, value] of Object.entries(statusMeta)) {
      expect(value).toHaveProperty('label')
      expect(statusLabels[key]).toBe(value.label)
    }
  })

  it('TOTAL_STEPS is 6', () => {
    expect(TOTAL_STEPS).toBe(6)
  })
})
