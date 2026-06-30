import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScoreStepper, StepperButton } from './ScoreStepper'

describe('ScoreStepper', () => {
  it('renders value and +/- buttons', () => {
    render(<ScoreStepper value={3} onChange={() => {}} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('−')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('increments on + click', () => {
    const onChange = vi.fn()
    render(<ScoreStepper value={0} onChange={onChange} />)
    fireEvent.click(screen.getByText('+'))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('decrements on − click', () => {
    const onChange = vi.fn()
    render(<ScoreStepper value={5} onChange={onChange} />)
    fireEvent.click(screen.getByText('−'))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('does not go below 0', () => {
    const onChange = vi.fn()
    render(<ScoreStepper value={0} onChange={onChange} />)
    const minusBtn = screen.getByText('−').closest('button')
    expect(minusBtn).toBeDisabled()
  })

  it('disables buttons when disabled prop is true', () => {
    render(<ScoreStepper value={5} onChange={() => {}} disabled />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(btn => expect(btn).toBeDisabled())
  })
})

describe('StepperButton', () => {
  it('stops propagation on click', () => {
    const onClick = vi.fn()
    const onParentClick = vi.fn()
    render(
      <div onClick={onParentClick}>
        <StepperButton onClick={onClick}>X</StepperButton>
      </div>
    )
    fireEvent.click(screen.getByText('X'))
    expect(onClick).toHaveBeenCalled()
    expect(onParentClick).not.toHaveBeenCalled()
  })
})
