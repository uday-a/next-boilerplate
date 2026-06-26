import { NextResponse } from 'next/server'
import { DEFAULT_AUTH_REDIRECT, safeRedirectPath } from '@/lib/auth/redirect'
import { env, hasGithubOAuth } from '@/lib/env'
import { getSession } from '@/lib/auth/session'
import { sessionUserFromGithub, setAuthSession, upsertGithubUser } from '@/lib/auth/github'
import { logger } from '@/server/utils/logger'

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string | null
}

export async function GET(request: Request) {
  if (!hasGithubOAuth) {
    return NextResponse.redirect(new URL('/login?error=oauth', request.url))
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const stateRaw = url.searchParams.get('state')
  let next = DEFAULT_AUTH_REDIRECT
  if (stateRaw) {
    try {
      const state = JSON.parse(Buffer.from(stateRaw, 'base64url').toString()) as { next?: string }
      next = safeRedirectPath(state.next)
    } catch {
      /* ignore bad state */
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=oauth', request.url))
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`,
      }),
    })
    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string }
    if (!tokenData.access_token) throw new Error(tokenData.error ?? 'no access_token')

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'next-boilerplate',
      },
    })
    const githubUser = (await userRes.json()) as GitHubUser

    let email = githubUser.email
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'next-boilerplate',
        },
      })
      const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[]
      email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? null
      githubUser.email = email
    }

    const { dbUserId, role } = await upsertGithubUser(githubUser)
    const session = await getSession()
    await setAuthSession(session, sessionUserFromGithub(githubUser, dbUserId, role))

    logger.info('auth.github.signin', { login: githubUser.login, role })
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    logger.error('auth.github.oauth_error', { error: String(error) })
    return NextResponse.redirect(new URL('/login?error=oauth', request.url))
  }
}
