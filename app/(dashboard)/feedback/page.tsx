import { localizedMetadata } from '@/lib/page-title'
import { FeedbackClient } from './feedback-client'

export function generateMetadata() {
  return localizedMetadata('/feedback')
}

export default function FeedbackPage() {
  return <FeedbackClient />
}