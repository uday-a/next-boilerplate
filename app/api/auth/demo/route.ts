import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { resolveDemoMode } from '@/lib/demo-mode'
import { requireRateLimit } from '@/server/utils/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ enabled: resolveDemoMode() })
}

export async function POST(request: Request) {
  try {
    requireRateLimit(request, { key: 'auth:demo' })
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again shortly.' } },
      { status: 429 },
    )
  }
  if (!resolveDemoMode()) {
    return NextResponse.json(
      { ok: false, error: 'Demo mode is disabled. Set DEMO_MODE=true in Vercel and redeploy.' },
      { status: 403 },
    )
  }

  const session = await getSession()
  session.user = {
    id: 0,
    login: 'john.doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://uday.cc/avatar-twitter.png',
    role: 'admin',
  }
  session.loggedInAt = Date.now()
  session.demo = true
  await session.save()

  return NextResponse.json({ ok: true })
}