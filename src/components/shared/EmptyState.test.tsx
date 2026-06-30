import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'
import { Info } from 'lucide-react'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={Info} title="No items" description="There are no items yet." />)
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('There are no items yet.')).toBeInTheDocument()
  })

  it('renders children when provided', () => {
    render(
      <EmptyState icon={Info} title="Empty" description="Nothing here">
        <button>Create</button>
      </EmptyState>
    )
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('does not render children when not provided', () => {
    render(<EmptyState icon={Info} title="Empty" description="Nothing" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
