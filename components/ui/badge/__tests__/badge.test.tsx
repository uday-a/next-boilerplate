import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge component', () => {
  it('renders with data-slot="badge"', () => {
    render(<Badge>Active</Badge>)
    const badge = screen.getByText('Active')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge).toHaveAttribute('data-uipkge')
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Badge variant="secondary">Pro</Badge>)
    expect(screen.getByText('Pro')).toHaveClass('bg-secondary')

    rerender(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-destructive')

    rerender(<Badge variant="outline">Draft</Badge>)
    expect(screen.getByText('Draft')).toHaveClass('text-foreground')
  })

  it('supports asChild rendering', () => {
    render(
      <Badge asChild>
        <a href="#tag">Tag link</a>
      </Badge>,
    )
    const link = screen.getByRole('link', { name: 'Tag link' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('data-slot', 'badge')
  })
})
