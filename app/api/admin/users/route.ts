import { apiHandler } from '@/lib/api/response'
import { requireRole } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'

export async function GET() {
  return apiHandler(async () => {
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