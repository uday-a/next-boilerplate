import { apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

// GET /api/team/members — roster for the team settings page. Auth-only (any
// signed-in role); invite management stays behind requireRole on
// /api/team/invites. Demo sessions and DB-less boots get a sample roster.
const DEMO_MEMBERS = [
  { id: 1, name: 'Olivia Bennett', email: 'olivia.bennett@acme.com', role: 'admin', avatarUrl: null, createdAt: '2025-11-04T09:12:00Z' },
  { id: 2, name: 'James Carter', email: 'james.carter@acme.com', role: 'admin', avatarUrl: null, createdAt: '2025-11-18T14:30:00Z' },
  { id: 3, name: 'Sophie Turner', email: 'sophie.turner@acme.com', role: 'editor', avatarUrl: null, createdAt: '2026-01-09T10:05:00Z' },
  { id: 4, name: 'Daniel Hughes', email: 'daniel.hughes@acme.com', role: 'editor', avatarUrl: null, createdAt: '2026-02-23T16:40:00Z' },
  { id: 5, name: 'Emma Collins', email: 'emma.collins@acme.com', role: 'user', avatarUrl: null, createdAt: '2026-04-02T08:55:00Z' },
  { id: 6, name: 'Lucas Meyer', email: 'lucas.meyer@acme.com', role: 'user', avatarUrl: null, createdAt: '2026-05-14T11:20:00Z' },
  { id: 7, name: 'Grace Walker', email: 'grace.walker@acme.com', role: 'user', avatarUrl: null, createdAt: '2026-07-21T13:15:00Z' },
  { id: 8, name: 'Henry Foster', email: 'henry.foster@acme.com', role: 'user', avatarUrl: null, createdAt: '2026-09-08T09:45:00Z' },
]

export async function GET() {
  return apiHandler(async () => {
    const session = await requireAuth()

    if (session.demo || !env.DATABASE_URL) return { members: DEMO_MEMBERS }

    try {
      const db = getDb()
      const rows = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          avatarUrl: schema.users.avatarUrl,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .orderBy(schema.users.createdAt)
      return { members: rows }
    } catch (e) {
      logger.error('team.members.list_failed', { error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not list team members. The users table may be missing — run `npm run db:migrate`.')
    }
  })
}
