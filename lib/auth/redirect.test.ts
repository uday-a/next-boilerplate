import { describe, it, expect } from 'vitest'
import { safeRedirectPath } from './redirect'

describe('safeRedirectPath', () => {
  it('allows same-site relative and absolute paths', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard')
    expect(safeRedirectPath('/pricing?plan=pro#checkout')).toBe('/pricing?plan=pro#checkout')
    expect(safeRedirectPath('/settings/billing')).toBe('/settings/billing')
  })

  it('rejects external URL targets and protocol-relative paths', () => {
    expect(safeRedirectPath('https://evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('http://malicious.com')).toBe('/dashboard')
    expect(safeRedirectPath('//evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('dashboard')).toBe('/dashboard')
    expect(safeRedirectPath('/\\evil.example')).toBe('/dashboard')
  })

  it('supports custom fallback path', () => {
    expect(safeRedirectPath(null, '/login')).toBe('/login')
    expect(safeRedirectPath('https://evil.example/phish', '/login')).toBe('/login')
  })
})
