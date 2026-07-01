import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/auth/redirect'
import { env, hasGithubOAuth } from '@/lib/env'

export async function GET(request: Request) {
  if (!hasGithubOAuth) {
    const login = new URL('/login', request.url)
    login.searchParams.set('error', 'oauth')
    return NextResponse.redirect(login)
  }

  const url = new URL(request.url)
  const next = safeRedirectPath(url.searchParams.get('next'))
  const state = Buffer.from(JSON.stringify({ next })).toString('base64url')

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID!,
    redirect_uri: `${env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`,
    scope: 'read:user user:email',
    state,
  })

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
}
