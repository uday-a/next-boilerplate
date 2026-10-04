import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { publicMetadata } from '@/lib/seo'
import { ForgotPasswordClient } from './forgot-password-client'

export const metadata = publicMetadata('/forgot-password', 'Sign-in link')

export default async function ForgotPasswordPage() {
  const session = await getSession()
  if (session.user) redirect('/dashboard')

  return <ForgotPasswordClient />
}