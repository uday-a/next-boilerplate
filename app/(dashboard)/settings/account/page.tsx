import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { localizedMetadata } from '@/lib/page-title'
import { AccountSettingsClient } from './account-client'

export function generateMetadata() {
  return localizedMetadata('/settings/account', 'nav.items.settings')
}

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