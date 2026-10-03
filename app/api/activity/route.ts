import { and, desc, eq, ilike } from 'drizzle-orm'
import { apiHandler } from '@/lib/api/response'
import { env } from '@/lib/env'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

// GET /api/activity — the caller's own audit trail, newest first.
// Without a DB (or for demo sessions, which have no rows to attribute)
// returns an empty list — the client renders its mock fallback.
export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireAuth()

    if (session.demo) return { items: [], total: 0 }
    if (!env.DATABASE_URL) return { items: [], total: 0 }

    const rawAction = new URL(request.url).searchParams.get('action')
    const actionFilter = rawAction && rawAction.trim() ? rawAction.trim().replace(/[%_\\]/g, '').slice(0, 64) : null

    try {
      const db = getDb()
      const where = actionFilter
        ? and(eq(schema.auditLogs.userId, session.user.id), ilike(schema.auditLogs.action, `%${actionFilter}%`))
        : eq(schema.auditLogs.userId, session.user.id)

      const items = await db
        .select({
          id: schema.auditLogs.id,
          userId: schema.auditLogs.userId,
          action: schema.auditLogs.action,
          entity: schema.auditLogs.entity,
          entityId: schema.auditLogs.entityId,
          metadata: schema.auditLogs.metadata,
          createdAt: schema.auditLogs.createdAt,
          actorEmail: schema.users.email,
        })
        .from(schema.auditLogs)
        .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
        .where(where)
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(50)

      return { items, total: items.length }
    } catch (e) {
      // Table missing or DB unreachable — surface empty rather than 500.
      logger.warn('activity.list_failed', { error: (e as Error).message })
      return { items: [], total: 0 }
    }
  })
}
