import { localizedMetadata } from '@/lib/page-title'
import { GeneralSettingsClient } from './general-client'

export function generateMetadata() {
  return localizedMetadata('/settings/general', 'nav.items.settings')
}

export default function GeneralSettingsPage() {
  return <GeneralSettingsClient />
}