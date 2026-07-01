import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { ForgotPasswordClient } from './forgot-password-client'

export const metadata = { title: 'Sign-in link' }

export default async function ForgotPasswordPage() {
  const session = await getSession()
  if (session.user) redirect('/dashboard')

  return <ForgotPasswordClient />
}