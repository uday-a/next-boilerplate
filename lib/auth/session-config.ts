import type { SessionOptions } from 'iron-session'

/** Shared iron-session config for Route Handlers + middleware (Edge). */
export function getSessionConfig(): SessionOptions {
  const password = process.env.AUTH_SECRET
  if (!password || password.length < 32) {
    throw new Error('AUTH_SECRET must be set (32+ chars) for session encryption')
  }
  const sevenDays = 60 * 60 * 24 * 7
  return {
    password,
    cookieName: 'uipkge_session',
    ttl: sevenDays,
    cookieOptions: {
      maxAge: sevenDays,
      // Secure unless explicitly in development (unset NODE_ENV = prod).
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    },
  }
}