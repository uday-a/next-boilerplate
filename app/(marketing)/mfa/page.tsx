import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { keyedMetadata } from '@/lib/page-title'
import { MfaClient } from './mfa-client'

export function generateMetadata() {
  return keyedMetadata('auth.mfa.title')
}

export default async function MfaPage() {
  const session = await getSession()
  if (session.user) redirect('/dashboard')

  return <MfaClient />
}