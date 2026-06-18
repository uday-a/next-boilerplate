import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { getSession } from '@/lib/auth/session'
import { setAuthSession } from '@/lib/auth/github'
import { useDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'
import { sendEmail, magicLinkEmail } from '@/server/utils/mailer'
import { generateToken, hashToken } from '@/server/utils/tokens'

const TOKEN_TTL_MIN = 15
const TOKEN_TTL_MS = TOKEN_TTL_MIN * 60 * 1000

const RequestSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
})

export async function POST(request: Request) {
  return apiHandler(async () => {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid email', { issues: parsed.error.issues })
    }
    const { email } = parsed.data

    if (!env.DATABASE_URL) {
      throw apiError('INTERNAL', 'Magic link sign-in requires a database. Configure DATABASE_URL or use GitHub OAuth.')
    }

    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

    try {
      const db = useDb()
      await db.insert(schema.magicLinkTokens).values({ email, tokenHash, expiresAt })
    } catch (e) {
      logger.error('auth.magic_link.db_insert_failed', { email, error: (e as Error).message })
      throw apiError(
        'INTERNAL',
        'Could not create sign-in link. The magic_link_tokens table may be missing — run `npm run db:migrate`.',
      )
    }

    const link = `${env.NEXT_PUBLIC_SITE_URL}/api/auth/magic-link?token=${token}`

    try {
      await sendEmail(magicLinkEmail({ email, link, expiresInMin: TOKEN_TTL_MIN }))
    } catch (e) {
      logger.error('auth.magic_link.send_failed', { email, error: (e as Error).message })
      throw apiError('INTERNAL', 'Sign-in link could not be sent. Check the email server (Resend) configuration.')
    }

    logger.info('auth.magic_link.requested', { email })
    return { expiresInMin: TOKEN_TTL_MIN }
  })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const login = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, request.url))

  if (!token) return login('magic-link-missing-token')
  if (!env.DATABASE_URL) return login('magic-link-db-required')

  const tokenHash = hashToken(token)

  let row: (typeof schema.magicLinkTokens.$inferSelect) | undefined
  try {
    const db = useDb()
    const rows = await db
      .select()
      .from(schema.magicLinkTokens)
      .where(eq(schema.magicLinkTokens.tokenHash, tokenHash))
      .limit(1)
    row = rows[0]
  } catch (e) {
    logger.error('auth.magic_link.lookup_failed', { error: (e as Error).message })
    return login('magic-link-failed')
  }

  if (!row) return login('magic-link-invalid')
  if (row.usedAt) return login('magic-link-used')
  if (row.expiresAt.getTime() < Date.now()) return login('magic-link-expired')

  const db = useDb()
  await db
    .update(schema.magicLinkTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.magicLinkTokens.id, row.id))

  const [user] = await db
    .insert(schema.users)
    .values({
      email: row.email,
      login: row.email.split('@')[0] ?? row.email,
      name: row.email.split('@')[0] ?? null,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { updatedAt: new Date() },
    })
    .returning()

  if (!user) return login('magic-link-failed')

  const session = await getSession()
  await setAuthSession(session, {
    id: user.id,
    login: user.login,
    name: user.name ?? user.login,
    email: user.email,
    avatar: user.avatarUrl,
    role: user.role,
  })

  logger.info('auth.magic_link.signin', { userId: user.id, email: user.email })
  return NextResponse.redirect(new URL('/dashboard', request.url))
}