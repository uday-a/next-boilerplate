import { localizedMetadata } from '@/lib/page-title'
import { LocationsClient } from './locations-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/locations')
}

export default function LocationsPage() {
  return <LocationsClient />
}
