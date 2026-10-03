import { localizedMetadata } from '@/lib/page-title'
import { DashboardClient } from './dashboard-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard')
}

export default function DashboardPage() {
  return <DashboardClient />
}