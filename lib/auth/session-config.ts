import type { SessionOptions } from 'iron-session'

/** Shared iron-session config for Route Handlers + middleware (Edge). */
export function getSessionConfig(): SessionOptions {
  const password = process.env.AUTH_SECRET
  if (!password || password.length < 32) {
    throw new Error('AUTH_SECRET must be set (32+ chars) for session encryption')
  }
  return {
    password,
    cookieName: 'uipkge_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    },
  }
}