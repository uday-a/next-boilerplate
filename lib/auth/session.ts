import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { SessionData } from './types'
import { getSessionConfig } from './session-config'

export const sessionOptions = getSessionConfig()

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionConfig())
}

export async function requireSession() {
  const session = await getSession()
  if (!session.user) {
    const { apiError, ErrorCode } = await import('@/lib/api/response')
    throw apiError(ErrorCode.UNAUTHORIZED, 'Authentication required')
  }
  return session
}