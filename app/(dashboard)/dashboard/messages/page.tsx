import { localizedMetadata } from '@/lib/page-title'
import { MessagesClient } from './messages-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/messages')
}

export default function MessagesPage() {
  return <MessagesClient />
}