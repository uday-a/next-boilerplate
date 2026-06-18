import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { AccountSettingsClient } from './account-client'

export const metadata = { title: 'Account · Settings' }

export default async function AccountSettingsPage() {
  const session = await getSession()
  if (!session.user) redirect('/login')

  return (
    <AccountSettingsClient
      userEmail={session.user.email}
      userAvatar={session.user.avatar}
      sessionName={session.user.name}
    />
  )
}