import { apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { requireAuth, requireRole } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'

// GET /api/admin/users — admin-only user list. Demo sessions and DB-less
// boots get a fixed sample list (same people as the /api/team/members demo
// roster); the role check uses the session cookie role in that mode.
const DEMO_USERS = [
  { id: 1, login: 'olivia.bennett', name: 'Olivia Bennett', role: 'admin', createdAt: '2025-11-04T09:12:00Z' },
  { id: 2, login: 'james.carter', name: 'James Carter', role: 'admin', createdAt: '2025-11-18T14:30:00Z' },
  { id: 3, login: 'sophie.turner', name: 'Sophie Turner', role: 'editor', createdAt: '2026-01-09T10:05:00Z' },
  { id: 4, login: 'daniel.hughes', name: 'Daniel Hughes', role: 'editor', createdAt: '2026-02-23T16:40:00Z' },
  { id: 5, login: 'emma.collins', name: 'Emma Collins', role: 'user', createdAt: '2026-04-02T08:55:00Z' },
  { id: 6, login: 'lucas.meyer', name: 'Lucas Meyer', role: 'user', createdAt: '2026-05-14T11:20:00Z' },
  { id: 7, login: 'grace.walker', name: 'Grace Walker', role: 'user', createdAt: '2026-07-21T13:15:00Z' },
  { id: 8, login: 'henry.foster', name: 'Henry Foster', role: 'user', createdAt: '2026-09-08T09:45:00Z' },
]

export async function GET() {
  return apiHandler(async () => {
    const authed = await requireAuth()
    if (authed.demo || !env.DATABASE_URL) {
      if (authed.user.role !== 'admin') {
        throw apiError('FORBIDDEN', `role '${authed.user.role}' is not permitted`)
      }
      return DEMO_USERS
    }

    await requireRole('admin')
    const db = getDb()
    return db
      .select({
        id: schema.users.id,
        login: schema.users.login,
        name: schema.users.name,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
  })
}
