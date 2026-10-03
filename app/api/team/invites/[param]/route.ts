import { eq } from 'drizzle-orm'
import { ApiError, apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { getSession } from '@/lib/auth/session'
import { requireAuth, requireRole } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { recordAudit } from '@/server/utils/audit'
import { hashToken } from '@/server/utils/tokens'
import { logger } from '@/server/utils/logger'

// /api/team/invites/:param — one route slot, two resources. Branch on the
// param's shape: numeric → invite id (DELETE revoke, auth + role);
// base64url token → public invite token (GET verify / POST accept).
const ID_RE = /^\d+$/
const TOKEN_RE = /^[\w-]{32,128}$/

type Params = { params: Promise<{ param: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { param } = await params
  if (ID_RE.test(param)) return handleInviteByIdDeleteGuard(param)
  if (TOKEN_RE.test(param)) return handleInviteTokenGet(param)
  return apiHandler(async () => {
    throw apiError('NOT_FOUND', 'Invite not found')
  })
}

export async function POST(_request: Request, { params }: Params) {
  const { param } = await params
  if (TOKEN_RE.test(param)) return handleInviteTokenPost(param)
  return apiHandler(async () => {
    if (ID_RE.test(param)) {
      throw apiError('NOT_FOUND', `Method POST not supported on /api/team/invites/:id`)
    }
    throw apiError('NOT_FOUND', 'Invite not found')
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { param } = await params
  if (ID_RE.test(param)) return handleInviteByIdDelete(param)
  return apiHandler(async () => {
    throw apiError('NOT_FOUND', `Method DELETE not supported on /api/team/invites/:token`)
  })
}

// Non-DELETE on a numeric id never mutates — reject like Nuxt's method guard.
function handleInviteByIdDeleteGuard(rawId: string) {
  return apiHandler(async () => {
    throw apiError('NOT_FOUND', `Method GET not supported on /api/team/invites/:id (invite ${rawId})`)
  })
}

// DELETE /api/team/invites/:id — revoke a pending invite (admin/editor).
// Only pending rows (acceptedAt IS NULL) can be revoked.
function handleInviteByIdDelete(rawId: string) {
  return apiHandler(async () => {
    const authed = await requireAuth()
    if (authed.demo) throw apiError('FORBIDDEN', 'Invites are disabled in demo mode.')

    await requireRole('admin', 'editor')

    if (!env.DATABASE_URL) {
      throw apiError('INTERNAL', 'Team invites require a database. Configure DATABASE_URL to manage invites.')
    }

    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) {
      throw apiError('VALIDATION_FAILED', 'Invalid invite id', { field: 'id' })
    }

    try {
      const db = getDb()
      const rows = await db.select().from(schema.invites).where(eq(schema.invites.id, id)).limit(1)
      const invite = rows[0]
      if (!invite) throw apiError('NOT_FOUND', `Invite ${id} not found`)
      if (invite.acceptedAt) {
        throw apiError('VALIDATION_FAILED', 'Invite was already accepted and cannot be revoked')
      }

      await db.delete(schema.invites).where(eq(schema.invites.id, id))

      await recordAudit({
        action: 'team.revoke',
        entity: 'invite',
        entityId: id,
        metadata: { email: invite.email },
      })
      logger.info('team.invite.revoked', { id, email: invite.email })

      return { revoked: id }
    } catch (e) {
      if (e instanceof ApiError) throw e
      logger.error('team.invite.revoke_failed', { id, error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not revoke invite. The invites table may be missing — run `npm run db:migrate`.')
    }
  })
}

// GET /api/team/invites/:token — public verify. The token IS the auth here:
// no session required to READ the invite, only to ACCEPT it.
function handleInviteTokenGet(rawToken: string) {
  return apiHandler(async () => {
    const invite = await lookupInviteToken(rawToken)
    return { email: invite.email, role: invite.role, valid: true }
  })
}

// POST /api/team/invites/:token — accept. Requires a session whose email
// matches the invite; applies the invited role to the user row.
function handleInviteTokenPost(rawToken: string) {
  return apiHandler(async () => {
    const invite = await lookupInviteToken(rawToken)

    const session = await getSession()
    if (!session.user) {
      throw apiError('VALIDATION_FAILED', 'signin required — sign in to accept this invite')
    }

    const sessionEmail = (session.user.email ?? '').toLowerCase()
    if (!sessionEmail || sessionEmail !== invite.email.toLowerCase()) {
      throw apiError('VALIDATION_FAILED', `signin required — sign in as ${invite.email} to accept this invite`)
    }

    try {
      const db = getDb()
      const updated = await db
        .update(schema.users)
        .set({ role: invite.role, updatedAt: new Date() })
        .where(eq(schema.users.email, invite.email))
        .returning({ id: schema.users.id })

      // Mark single-use BEFORE returning, so a crash can't leave it reusable.
      await db.update(schema.invites).set({ acceptedAt: new Date() }).where(eq(schema.invites.id, invite.id))

      await recordAudit({
        userId: updated[0]?.id ?? null,
        action: 'team.accept',
        entity: 'invite',
        entityId: invite.id,
        metadata: { email: invite.email, role: invite.role },
      })

      // Patch the in-memory session so the UI reflects the new role
      // without forcing a re-login.
      try {
        if (session.user) session.user.role = invite.role
        await session.save()
      } catch (e) {
        logger.warn('team.accept.session_patch_failed', { error: (e as Error).message })
      }

      logger.info('team.invite.accepted', { email: invite.email, role: invite.role })
      return { accepted: true, email: invite.email, role: invite.role }
    } catch (e) {
      if (e instanceof ApiError) throw e
      logger.error('team.invite.accept_failed', { email: invite.email, error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not accept invite. Please try again.')
    }
  })
}

async function lookupInviteToken(rawToken: string) {
  if (!env.DATABASE_URL) throw apiError('NOT_FOUND', 'Invite not found')

  const tokenHash = hashToken(rawToken)

  let invite: typeof schema.invites.$inferSelect | undefined
  try {
    const db = getDb()
    const rows = await db.select().from(schema.invites).where(eq(schema.invites.tokenHash, tokenHash)).limit(1)
    invite = rows[0]
  } catch (e) {
    logger.error('team.invite.lookup_failed', { error: (e as Error).message })
    throw apiError('INTERNAL', 'Could not verify invite. The invites table may be missing — run `npm run db:migrate`.')
  }

  if (!invite) throw apiError('NOT_FOUND', 'Invite not found')
  if (invite.acceptedAt) throw apiError('VALIDATION_FAILED', 'This invite has already been accepted')
  if (invite.expiresAt.getTime() < Date.now()) {
    throw apiError('VALIDATION_FAILED', 'This invite has expired — ask your admin for a new one')
  }
  return invite
}
