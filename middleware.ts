import { getIronSession } from 'iron-session'
import { NextResponse, type NextRequest } from 'next/server'
import { getSessionConfig } from '@/lib/auth/session-config'
import type { SessionData } from '@/lib/auth/types'

const protectedPrefixes = ['/dashboard', '/settings', '/projects', '/support', '/feedback', '/onboarding']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (!isProtected) return NextResponse.next()

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, getSessionConfig())

  if (!session.user) {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/projects/:path*', '/support', '/feedback', '/onboarding'],
}