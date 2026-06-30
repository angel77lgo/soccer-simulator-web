import { describe, it, expect } from 'vitest'
import { cn, getFlagSvgUrl } from './utils'

describe('cn', () => {
  it('merges tailwind classes and removes conflicts', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('handles falsy values', () => {
    expect(cn('px-4', false, null, undefined, 'py-2')).toBe('px-4 py-2')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
})

describe('getFlagSvgUrl', () => {
  it('returns un.svg for empty or falsy code', () => {
    expect(getFlagSvgUrl('')).toBe('https://flagcdn.com/un.svg')
    expect(getFlagSvgUrl(undefined as any)).toBe('https://flagcdn.com/un.svg')
  })

  it('returns special URL for ENG', () => {
    const url = getFlagSvgUrl('ENG')
    expect(url).toContain('GB-ENG')
  })

  it('returns special URL for WAL', () => {
    const url = getFlagSvgUrl('wal')
    expect(url).toContain('GB-WLS')
  })

  it('returns special URL for SCO', () => {
    const url = getFlagSvgUrl('sCo')
    expect(url).toContain('GB-SCT')
  })

  it('returns special URL for NIR', () => {
    const url = getFlagSvgUrl('nir')
    expect(url).toContain('GB-NIR')
  })

  it('maps FIFA codes to flagcdn.com for mapped codes', () => {
    expect(getFlagSvgUrl('BRA')).toBe('https://flagcdn.com/br.svg')
    expect(getFlagSvgUrl('ESP')).toBe('https://flagcdn.com/es.svg')
    expect(getFlagSvgUrl('ARG')).toBe('https://flagcdn.com/ar.svg')
    expect(getFlagSvgUrl('JPN')).toBe('https://flagcdn.com/jp.svg')
  })

  it('falls back to first two chars for unknown codes', () => {
    const url = getFlagSvgUrl('XYZ')
    expect(url).toBe('https://flagcdn.com/xy.svg')
  })

  it('trims and uppercases input', () => {
    expect(getFlagSvgUrl('  bra ')).toBe('https://flagcdn.com/br.svg')
  })
})
