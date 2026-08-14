import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (classNames merger)', () => {
  it('merges single and multiple classes', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conditional falsy expressions', () => {
    expect(cn('base', false && 'hidden', null, undefined, 'active')).toBe('base active')
  })

  it('correctly resolves Tailwind class collisions (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('bg-primary text-white', 'bg-secondary')).toBe('text-white bg-secondary')
  })
})
