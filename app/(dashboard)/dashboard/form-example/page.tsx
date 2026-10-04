import { localizedMetadata } from '@/lib/page-title'
import { FormExampleClient } from './form-example-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/form-example')
}

export default function FormExamplePage() {
  return <FormExampleClient />
}
