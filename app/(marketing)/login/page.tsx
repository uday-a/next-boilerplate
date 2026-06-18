import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/lib/auth/session'
import { isDemoMode } from '@/lib/env'
import { LoginClient } from './login-client'

export const metadata = { title: 'Sign in' }

// Read DEMO_MODE at request time on Vercel -- never bake into static HTML.
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const session = await getSession()
  if (session.user) redirect('/dashboard')

  return (
    <Suspense>
      <LoginClient demoMode={isDemoMode} />
    </Suspense>
  )
}