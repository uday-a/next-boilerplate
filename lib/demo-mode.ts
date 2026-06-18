/**
 * Demo mode flag -- read at request time (never cache at build).
 * Accepts DEMO_MODE or NEXT_PUBLIC_DEMO_MODE so Vercel dashboard vars work
 * whether scoped to server-only or exposed to the client.
 */
export function resolveDemoMode(): boolean {
  const flag = (process.env.DEMO_MODE ?? process.env.NEXT_PUBLIC_DEMO_MODE)?.trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  // Vercel preview deployments: default demo on unless explicitly disabled.
  if (process.env.VERCEL_ENV === 'preview') return true
  // Auto-on in dev when unset; auto-off in production.
  return process.env.NODE_ENV !== 'production'
}