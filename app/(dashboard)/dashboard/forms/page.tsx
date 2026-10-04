import { localizedMetadata } from '@/lib/page-title'
import { FormsClient } from './forms-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/forms')
}

export default function FormsPage() {
  return <FormsClient />
}
