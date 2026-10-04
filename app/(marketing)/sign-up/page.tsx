import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { publicMetadata } from '@/lib/seo'
import { SignUpClient } from './sign-up-client'

export const metadata = publicMetadata('/sign-up', 'Create an account')

export default async function SignUpPage() {
  const session = await getSession()
  if (session.user) redirect('/dashboard')

  return <SignUpClient />
}