import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { SignUpClient } from './sign-up-client'

export const metadata = { title: 'Create an account' }

export default async function SignUpPage() {
  const session = await getSession()
  if (session.user) redirect('/dashboard')

  return <SignUpClient />
}