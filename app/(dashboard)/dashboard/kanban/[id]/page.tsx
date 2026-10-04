import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createInitialColumns } from '@/lib/kanban-data'
import { findTaskById } from '@/lib/use-kanban'
import { KanbanPageClient } from '../kanban-client'

type Props = { params: Promise<{ id: string }> }

function findTask(id: string) {
  return findTaskById(createInitialColumns(), decodeURIComponent(id))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const task = findTask((await params).id)
  // Root layout's template appends " | UIPKGE".
  return { title: task?.title }
}

// Renders the board with this task's detail sheet open.
export default async function KanbanTaskPage({ params }: Props) {
  const task = findTask((await params).id)
  if (!task) notFound()
  // key: remount per task so the sheet opens fresh when hopping between tasks.
  return <KanbanPageClient key={task.id} taskId={task.id} />
}
