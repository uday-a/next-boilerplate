import { apiHandler } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'

export async function GET() {
  return apiHandler(async () => {
    const session = await requireAuth()
    return { user: session.user, loggedInAt: session.loggedInAt }
  })
}