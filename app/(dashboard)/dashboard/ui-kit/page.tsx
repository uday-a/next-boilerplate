import { Suspense } from 'react'
import { localizedMetadata } from '@/lib/page-title'
import { UiKitClient } from './ui-kit-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/ui-kit')
}

export default function UiKitPage() {
  // useSearchParams (finder filters live in the URL) needs a Suspense boundary.
  return (
    <Suspense>
      <UiKitClient />
    </Suspense>
  )
}
