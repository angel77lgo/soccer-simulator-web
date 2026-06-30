import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './index'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ theme: 'dark' })
  })

  it('initializes with dark theme', () => {
    const state = useAppStore.getState()
    expect(state.theme).toBe('dark')
  })

  it('toggles from dark to light', () => {
    useAppStore.getState().toggleTheme()
    expect(useAppStore.getState().theme).toBe('light')
  })

  it('toggles from light back to dark', () => {
    useAppStore.setState({ theme: 'light' })
    useAppStore.getState().toggleTheme()
    expect(useAppStore.getState().theme).toBe('dark')
  })
})
