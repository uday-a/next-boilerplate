import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { resolveDemoMode } from '@/lib/demo-mode'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ enabled: resolveDemoMode() })
}

export async function POST() {
  if (!resolveDemoMode()) {
    return NextResponse.json(
      { ok: false, error: 'Demo mode is disabled. Set DEMO_MODE=true in Vercel and redeploy.' },
      { status: 403 },
    )
  }

  const session = await getSession()
  session.user = {
    id: 0,
    login: 'demo',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: null,
    role: 'admin',
  }
  session.loggedInAt = Date.now()
  session.demo = true
  await session.save()

  return NextResponse.json({ ok: true })
}