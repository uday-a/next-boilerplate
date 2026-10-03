import { localizedMetadata } from '@/lib/page-title'
import { KanbanPageClient } from './kanban-client'

export function generateMetadata() {
  return localizedMetadata('/dashboard/kanban')
}

export default function KanbanPage() {
  return <KanbanPageClient />
}