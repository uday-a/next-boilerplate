import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button component', () => {
  it('renders standard button element with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'destructive')

    rerender(<Button variant="outline">Cancel</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'secondary')
  })

  it('applies size classes', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Action</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Action' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('supports asChild rendering for Link wrappers', () => {
    render(
      <Button asChild>
        <a href="/login">Go to Login</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Go to Login' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/login')
    expect(link).toHaveAttribute('data-slot', 'button')
  })

  it('respects disabled state', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
