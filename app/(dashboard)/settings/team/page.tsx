import { getSession } from '@/lib/auth/session'
import { localizedMetadata } from '@/lib/page-title'
import { TeamSettingsClient } from './team-client'

export function generateMetadata() {
  return localizedMetadata('/settings/team')
}

export default async function TeamSettingsPage() {
  const session = await getSession()
  return <TeamSettingsClient role={session.user?.role} />
}
