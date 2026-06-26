import { eq } from 'drizzle-orm'
import type { SessionData } from '@/lib/auth/types'
import { apiError } from '@/lib/api/response'
import { getSession } from '@/lib/auth/session'
import { getDb, schema } from '@/server/db'
import { ROLES, type Role } from '@/server/db/schema'
import { logger } from './logger'

export async function requireAuth(): Promise<SessionData & { user: NonNullable<SessionData['user']> }> {
  const session = await getSession()
  if (!session.user) throw apiError('UNAUTHORIZED', 'Authentication required')
  return session as SessionData & { user: NonNullable<SessionData['user']> }
}

export async function requireRole(...allowedInput: (Role | Role)[]) {
  const allowed = allowedInput.flat()
  const session = await requireAuth()

  const lookup = await readLiveRole(session.user.id)
  let role: Role
  if (lookup.state === 'found') {
    role = lookup.role
  } else if (lookup.state === 'not-found') {
    throw apiError('SESSION_INVALID', 'Account no longer exists')
  } else {
    role = session.user.role
  }

  if (!allowed.includes(role)) {
    throw apiError('FORBIDDEN', `role '${role}' is not permitted`)
  }

  if (lookup.state === 'found' && lookup.role !== session.user.role) {
    session.user.role = lookup.role
  }

  return session
}

type RoleLookup = { state: 'found'; role: Role } | { state: 'not-found' } | { state: 'db-unavailable' }

async function readLiveRole(userId: number): Promise<RoleLookup> {
  try {
    const db = getDb()
    const row = await db
      .select({ role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1)
    const r = row[0]?.role
    if (!r) return { state: 'not-found' }
    if ((ROLES as readonly string[]).includes(r)) return { state: 'found', role: r as Role }
    return { state: 'not-found' }
  } catch (e) {
    logger.warn('guards.live_role_lookup_failed', { error: (e as Error).message })
    return { state: 'db-unavailable' }
  }
}