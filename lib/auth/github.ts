import type { IronSession } from 'iron-session'
import { env } from '@/lib/env'
import type { SessionData, SessionUser } from '@/lib/auth/types'
import { getDb, schema } from '@/server/db'
import { ROLES, type Role } from '@/server/db/schema'
import { logger } from '@/server/utils/logger'
import { sendEmail, welcomeEmail } from '@/server/utils/mailer'

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string | null
}

export async function upsertGithubUser(githubUser: GitHubUser) {
  const bootstrapAdmins = (env.INITIAL_ADMIN_LOGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const initialRole: Role = bootstrapAdmins.includes(githubUser.login) ? 'admin' : 'user'
  const userEmail = githubUser.email ?? `${githubUser.login}@users.noreply.github.com`

  let role: Role = initialRole
  let isFirstSignin = false
  let dbUserId = githubUser.id

  try {
    const db = getDb()
    const returned = await db
      .insert(schema.users)
      .values({
        githubId: githubUser.id,
        login: githubUser.login,
        name: githubUser.name ?? githubUser.login,
        email: userEmail,
        avatarUrl: githubUser.avatar_url,
        role: initialRole,
      })
      .onConflictDoUpdate({
        target: schema.users.githubId,
        set: {
          login: githubUser.login,
          name: githubUser.name ?? githubUser.login,
          email: userEmail,
          avatarUrl: githubUser.avatar_url,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: schema.users.id,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      })

    const row = returned[0]
    if (row) {
      dbUserId = row.id
      const now = Date.now()
      const created = row.createdAt.getTime()
      const updated = row.updatedAt.getTime()
      isFirstSignin = now - created < 5000 && Math.abs(created - updated) < 1000
      if ((ROLES as readonly string[]).includes(row.role)) role = row.role as Role
    }
  } catch (e) {
    logger.warn('auth.github.db_upsert_skipped', {
      login: githubUser.login,
      error: (e as Error).message,
    })
  }

  if (isFirstSignin && githubUser.email) {
    sendEmail(
      welcomeEmail({
        name: githubUser.name ?? githubUser.login,
        email: githubUser.email,
        siteUrl: env.NEXT_PUBLIC_SITE_URL,
      }),
    ).catch((err) => {
      logger.warn('auth.github.welcome_send_failed', {
        login: githubUser.login,
        error: (err as Error).message,
      })
    })
  }

  return { dbUserId, role }
}

export function sessionUserFromGithub(githubUser: GitHubUser, dbUserId: number, role: Role): SessionUser {
  return {
    id: dbUserId,
    login: githubUser.login,
    name: githubUser.name ?? githubUser.login,
    email: githubUser.email ?? `${githubUser.login}@users.noreply.github.com`,
    avatar: githubUser.avatar_url,
    role,
  }
}

export async function setAuthSession(session: IronSession<SessionData>, user: SessionUser, demo = false) {
  session.user = user
  session.loggedInAt = Date.now()
  session.demo = demo
  await session.save()
}
