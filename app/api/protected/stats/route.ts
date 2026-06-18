import { apiHandler } from '@/lib/api/response'
import { requireRole } from '@/server/utils/guards'

export async function GET() {
  return apiHandler(async () => {
    await requireRole('admin', 'editor')
    return {
      totalUsers: 42,
      totalProjects: 7,
      lastUpdated: new Date().toISOString(),
    }
  })
}