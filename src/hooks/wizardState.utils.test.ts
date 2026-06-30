import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  normalizeText,
  normalizeName,
  getStorageKey,
  saveWizardState,
  loadWizardState,
  clearWizardState,
  parseSlotId,
} from './wizardState.utils'

const STORAGE_KEY_PREFIX = 'wizard_tournament_'

describe('normalizeText', () => {
  it('returns empty string for undefined', () => {
    expect(normalizeText(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(normalizeText('')).toBe('')
  })

  it('removes accents and lowercases', () => {
    expect(normalizeText('México')).toBe('mexico')
    expect(normalizeText('FranÇa')).toBe('franca')
    expect(normalizeText('São Paulo')).toBe('sao paulo')
    expect(normalizeText('Über Cool')).toBe('uber cool')
  })

  it('handles already lowercase without accents', () => {
    expect(normalizeText('argentina')).toBe('argentina')
  })
})

describe('normalizeName', () => {
  it('lowercases and slugifies', () => {
    expect(normalizeName('Copa del Mundo 2026')).toBe('copa-del-mundo-2026')
  })

  it('trims leading and trailing hyphens', () => {
    expect(normalizeName('--hello--')).toBe('hello')
  })

  it('collapses multiple separators', () => {
    expect(normalizeName('a   b!!!c')).toBe('a-b-c')
  })
})

describe('getStorageKey', () => {
  it('generates key with prefix, literal "my-torneo-" and slug', () => {
    expect(getStorageKey('My Torneo')).toBe('wizard_tournament_my-torneo-my-torneo')
  })
})

describe('saveWizardState', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves state to localStorage', () => {
    const state = { step: 2, name: 'Test' } as any
    saveWizardState('Test', state)
    const key = `${STORAGE_KEY_PREFIX}my-torneo-test`
    expect(localStorage.getItem(key)).toBe(JSON.stringify(state))
  })

  it('does nothing if name is empty', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    saveWizardState('', { step: 1 } as any)
    expect(setItem).not.toHaveBeenCalled()
  })

  it('does not throw on localStorage error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveWizardState('Test', { step: 1 } as any)).not.toThrow()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})

describe('loadWizardState', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns null if name is empty', () => {
    expect(loadWizardState('')).toBeNull()
  })

  it('returns null if no stored state', () => {
    expect(loadWizardState('NonExistent')).toBeNull()
  })

  it('loads saved state', () => {
    const state = { step: 3, name: 'Test' }
    localStorage.setItem(`${STORAGE_KEY_PREFIX}my-torneo-test`, JSON.stringify(state))
    expect(loadWizardState('Test')).toEqual(state)
  })

  it('returns null on JSON parse error', () => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}my-torneo-test`, 'not-json')
    expect(loadWizardState('Test')).toBeNull()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})

describe('clearWizardState', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('removes stored state from localStorage', () => {
    const key = `${STORAGE_KEY_PREFIX}my-torneo-test`
    localStorage.setItem(key, '{}')
    clearWizardState('Test')
    expect(localStorage.getItem(key)).toBeNull()
  })

  it('does nothing if name is empty', () => {
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
    clearWizardState('')
    expect(removeItem).not.toHaveBeenCalled()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})

describe('parseSlotId', () => {
  it('parses valid slot id', () => {
    expect(parseSlotId('slot-3-1')).toEqual({ gIndex: 3, sIndex: 1 })
  })

  it('returns null for non-slot prefix', () => {
    expect(parseSlotId('pot-0')).toBeNull()
  })

  it('returns null for wrong parts length', () => {
    expect(parseSlotId('slot-0')).toBeNull()
    expect(parseSlotId('slot-0-1-2')).toBeNull()
  })

  it('returns null if indices are NaN', () => {
    expect(parseSlotId('slot-abc-1')).toBeNull()
    expect(parseSlotId('slot-0-xyz')).toBeNull()
  })
})
