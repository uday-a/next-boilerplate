import { localizedMetadata } from '@/lib/page-title'
import { NotificationsSettingsClient } from './notifications-client'

export function generateMetadata() {
  return localizedMetadata('/settings/notifications')
}

export default function NotificationsSettingsPage() {
  return <NotificationsSettingsClient />
}
