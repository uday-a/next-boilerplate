import { desc, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { ApiError, apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { requireAuth, requireRole } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { ROLES, type Role } from '@/server/db/schema'
import { recordAudit } from '@/server/utils/audit'
import { sendEmail, inviteEmail } from '@/server/utils/mailer'
import { generateToken, hashToken } from '@/server/utils/tokens'
import { requireRateLimit } from '@/server/utils/rate-limit'
import { logger } from '@/server/utils/logger'

// Team invites: GET list pending (admin/editor), POST create + email link.
// Token discipline mirrors the magic-link flow: SHA-256 hash persisted, raw
// token only in the emailed /invite/<raw> link, 7-day TTL, single-use via
// acceptedAt.
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

const DEMO_INVITES = [
  { id: 101, email: 'chloe.morgan@acme.com', role: 'editor', invitedBy: 1, expiresAt: '2026-10-05T10:00:00Z', createdAt: '2026-09-28T10:00:00Z' },
  { id: 102, email: 'ryan.brooks@acme.com', role: 'user', invitedBy: 2, expiresAt: '2026-10-03T15:30:00Z', createdAt: '2026-09-26T15:30:00Z' },
]

const InviteBody = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
})

export async function GET() {
  return apiHandler(async () => {
    // Demo sessions have no `users` row, so gate on the cookie role.
    const authed = await requireAuth()
    if (authed.demo) {
      if (!['admin', 'editor'].includes(authed.user.role)) {
        throw apiError('FORBIDDEN', `role '${authed.user.role}' is not permitted`)
      }
      return { invites: DEMO_INVITES }
    }

    await requireRole('admin', 'editor')

    if (!env.DATABASE_URL) return { invites: DEMO_INVITES }
    try {
      const db = getDb()
      const rows = await db
        .select({
          id: schema.invites.id,
          email: schema.invites.email,
          role: schema.invites.role,
          invitedBy: schema.invites.invitedBy,
          expiresAt: schema.invites.expiresAt,
          createdAt: schema.invites.createdAt,
        })
        .from(schema.invites)
        .where(isNull(schema.invites.acceptedAt))
        .orderBy(desc(schema.invites.createdAt))
      return { invites: rows }
    } catch (e) {
      logger.error('team.invites.list_failed', { error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not list invites. The invites table may be missing — run `npm run db:migrate`.')
    }
  })
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    requireRateLimit(request, { key: 'team:invites' })
    const authed = await requireAuth()
    if (authed.demo) throw apiError('FORBIDDEN', 'Invites are disabled in demo mode.')

    const session = await requireRole('admin', 'editor')
    const parsed = InviteBody.safeParse(await request.json())
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid invite payload', { issues: parsed.error.issues })
    }

    if (!env.DATABASE_URL) {
      throw apiError('INTERNAL', 'Team invites require a database. Configure DATABASE_URL to send invites.')
    }

    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS)

    try {
      const db = getDb()
      const invitedBy = session.user.id === 0 ? null : session.user.id

      const [invite] = await db
        .insert(schema.invites)
        .values({
          email: parsed.data.email,
          role: parsed.data.role as Role,
          tokenHash,
          invitedBy,
          expiresAt,
        })
        .returning({
          id: schema.invites.id,
          email: schema.invites.email,
          role: schema.invites.role,
          expiresAt: schema.invites.expiresAt,
          createdAt: schema.invites.createdAt,
        })

      const link = `${env.NEXT_PUBLIC_SITE_URL}/invite/${token}`
      const inviterLabel = session.user.name ?? session.user.login ?? undefined
      try {
        await sendEmail(inviteEmail({ email: parsed.data.email, link, role: parsed.data.role, inviter: inviterLabel }))
      } catch (e) {
        // Invite row already exists — a mailer outage shouldn't roll it back.
        logger.error('team.invite.send_failed', { email: parsed.data.email, error: (e as Error).message })
      }

      await recordAudit({
        userId: invitedBy,
        action: 'team.invite',
        entity: 'invite',
        entityId: invite?.id,
        metadata: { email: parsed.data.email, role: parsed.data.role },
      })
      logger.info('team.invite.created', { email: parsed.data.email, role: parsed.data.role })

      return { invite }
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw apiError('VALIDATION_FAILED', 'An invite is already pending for this email', { field: 'email' })
      }
      if (e instanceof ApiError) throw e
      logger.error('team.invite.create_failed', { email: parsed.data.email, error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not create invite. The invites table may be missing — run `npm run db:migrate`.')
    }
  })
}
