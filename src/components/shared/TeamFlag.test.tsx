import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeamFlag } from './TeamFlag'

describe('TeamFlag', () => {
  it('renders an img with the correct flag URL', () => {
    render(<TeamFlag code="BRA" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://flagcdn.com/br.svg')
  })

  it('applies alt text from code', () => {
    render(<TeamFlag code="ARG" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'ARG')
  })

  it('applies custom alt text', () => {
    render(<TeamFlag code="ESP" alt="Spain flag" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Spain flag')
  })

  it('applies className', () => {
    const { container } = render(<TeamFlag code="USA" className="custom-class" />)
    const span = container.firstChild as HTMLElement
    expect(span.className).toContain('custom-class')
  })
})
