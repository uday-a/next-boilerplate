import { localizedMetadata } from '@/lib/page-title'
import { ApiKeysSettingsClient } from './api-keys-client'

export function generateMetadata() {
  return localizedMetadata('/settings/api-keys')
}

export default function ApiKeysSettingsPage() {
  return <ApiKeysSettingsClient />
}
