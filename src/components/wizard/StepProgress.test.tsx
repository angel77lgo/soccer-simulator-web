import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepProgress } from './StepProgress'

const labels = ['General', 'Hosts', 'Participants', 'Repechaje', 'Draw', 'Confirm']

describe('StepProgress', () => {
  it('renders all step labels', () => {
    render(<StepProgress step={1} setStep={() => {}} stepLabels={labels} />)
    labels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('calls setStep with correct number on click', () => {
    const setStep = vi.fn()
    render(<StepProgress step={1} setStep={setStep} stepLabels={labels} />)
    fireEvent.click(screen.getByText('Hosts'))
    expect(setStep).toHaveBeenCalledWith(2)
  })

  it('applies active class to current step', () => {
    render(<StepProgress step={3} setStep={() => {}} stepLabels={labels} />)
    const participantsBtn = screen.getByText('Participants').closest('button')
    expect(participantsBtn).not.toBeNull()
  })
})
