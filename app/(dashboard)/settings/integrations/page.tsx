import { localizedMetadata } from '@/lib/page-title'
import { IntegrationsSettingsClient } from './integrations-client'

export function generateMetadata() {
  return localizedMetadata('/settings/integrations')
}

export default function IntegrationsSettingsPage() {
  return <IntegrationsSettingsClient />
}
