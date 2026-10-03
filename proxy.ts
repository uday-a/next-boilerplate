import { getIronSession } from 'iron-session'
import { NextResponse, type NextRequest } from 'next/server'
import { getSessionConfig } from '@/lib/auth/session-config'
import type { SessionData } from '@/lib/auth/types'

const protectedPrefixes = ['/dashboard', '/settings', '/projects', '/support', '/feedback', '/onboarding', '/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (!isProtected) return NextResponse.next()

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, getSessionConfig())

  if (!session.user) {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', pathname + request.nextUrl.search)
    return NextResponse.redirect(login)
  }

  // Role gate (Nuxt middleware/role.ts): /admin/* is admin-only. Reads the
  // cookie role — navigation polish only; requireRole() re-checks the DB
  // on every admin API call.
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard?error=forbidden', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/projects/:path*',
    '/support',
    '/feedback',
    '/onboarding',
    '/admin/:path*',
  ],
}
