import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

const UpdateProfile = z.object({
  name: z.string().trim().min(1).max(128).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
  locale: z.string().trim().min(2).max(8).optional(),
  notifyEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
})

export async function GET() {
  return apiHandler(async () => {
    const session = await requireAuth()
    if (session.demo) {
      return {
        profile: {
          name: session.user.name,
          bio: 'Demo account — changes here aren’t persisted.',
          timezone: 'UTC',
          locale: 'en',
          notifyEmail: true,
          notifyInApp: true,
        },
      }
    }
    const db = getDb()
    const [row] = await db
      .select({
        name: schema.users.name,
        bio: schema.users.bio,
        timezone: schema.users.timezone,
        locale: schema.users.locale,
        notifyEmail: schema.users.notifyEmail,
        notifyInApp: schema.users.notifyInApp,
      })
      .from(schema.users)
      .where(eq(schema.users.id, session.user.id))
      .limit(1)
    if (!row) throw apiError('SESSION_INVALID', 'Account no longer exists')
    return { profile: row }
  })
}

export async function PUT(request: Request) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = UpdateProfile.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid profile payload', { issues: parsed.error.issues })
    }

    if (session.demo) {
      return { profile: parsed.data, demo: true }
    }

    const db = getDb()
    const [updated] = await db
      .update(schema.users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.users.id, session.user.id))
      .returning({
        name: schema.users.name,
        bio: schema.users.bio,
        timezone: schema.users.timezone,
        locale: schema.users.locale,
        notifyEmail: schema.users.notifyEmail,
        notifyInApp: schema.users.notifyInApp,
      })
    if (!updated) throw apiError('SESSION_INVALID', 'Account no longer exists')
    logger.info('me.profile.updated', { userId: session.user.id, fields: Object.keys(parsed.data) })
    return { profile: updated }
  })
}