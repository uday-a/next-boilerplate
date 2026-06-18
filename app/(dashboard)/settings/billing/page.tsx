import { BillingSettingsClient } from './billing-client'

export const metadata = { title: 'Billing · Settings' }

interface BillingSettingsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function BillingSettingsPage({ searchParams }: BillingSettingsPageProps) {
  const params = await searchParams
  return <BillingSettingsClient justCheckedOut={params.status === 'success'} />
}