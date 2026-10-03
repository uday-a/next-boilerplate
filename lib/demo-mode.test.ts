import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveDemoMode } from './demo-mode'

// Demo mode hands out admin sessions to anyone, so it must only auto-enable
// for an explicit local `next dev`, never for an unset/prod NODE_ENV.
function withEnv(nodeEnv: string | undefined, flag?: string) {
  vi.stubEnv('NODE_ENV', nodeEnv)
  vi.stubEnv('DEMO_MODE', flag)
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', undefined)
  return resolveDemoMode()
}

describe('resolveDemoMode', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('is off when NODE_ENV is unset', () => {
    expect(withEnv(undefined)).toBe(false)
  })
  it('is off in production and test', () => {
    expect(withEnv('production')).toBe(false)
    expect(withEnv('test')).toBe(false)
  })
  it('is on in development (next dev)', () => {
    expect(withEnv('development')).toBe(true)
  })
  it('DEMO_MODE=true forces it on, even in production', () => {
    expect(withEnv(undefined, 'true')).toBe(true)
    expect(withEnv('production', 'true')).toBe(true)
  })
  it('DEMO_MODE=false forces it off, even in development', () => {
    expect(withEnv('development', 'false')).toBe(false)
  })
})
