import { localizedMetadata } from '@/lib/page-title'
import { SecuritySettingsClient } from './security-client'

export function generateMetadata() {
  return localizedMetadata('/settings/security')
}

export default function SecuritySettingsPage() {
  return <SecuritySettingsClient />
}
