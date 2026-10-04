import { localizedMetadata } from '@/lib/page-title'
import { ActivitySettingsClient } from './activity-client'

export function generateMetadata() {
  return localizedMetadata('/settings/activity')
}

export default function ActivitySettingsPage() {
  return <ActivitySettingsClient />
}
