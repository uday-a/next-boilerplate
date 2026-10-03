import { localizedMetadata } from '@/lib/page-title'
import { CalendarClient } from './calendar-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/calendar')
}

export default function CalendarPage() {
  return <CalendarClient />
}