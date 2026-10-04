import { localizedMetadata } from '@/lib/page-title'
import { ActivityClient } from './activity-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/activity')
}

export default function ActivityPage() {
  return <ActivityClient />
}
