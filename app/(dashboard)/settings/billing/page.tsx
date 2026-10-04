import { localizedMetadata } from '@/lib/page-title'
import { BillingSettingsClient } from './billing-client'

export function generateMetadata() {
  return localizedMetadata('/settings/billing')
}

interface BillingSettingsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function BillingSettingsPage({ searchParams }: BillingSettingsPageProps) {
  const params = await searchParams
  return <BillingSettingsClient justCheckedOut={params.status === 'success'} />
}