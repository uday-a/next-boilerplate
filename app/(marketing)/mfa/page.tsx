import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { MfaClient } from './mfa-client'

export const metadata = { title: 'Two-step verification' }

export default async function MfaPage() {
  const session = await getSession()
  if (session.user) redirect('/dashboard')

  return <MfaClient />
}