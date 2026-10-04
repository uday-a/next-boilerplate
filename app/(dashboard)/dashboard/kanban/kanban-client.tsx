'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { KanbanBoard } from '@/components/blocks/kanban-board/KanbanBoard'
import { createInitialColumns } from '@/lib/kanban-data'
import type { KanbanColumn } from '@/lib/use-kanban'

// Seeded from createInitialColumns(); replace it with a real fetcher when wiring to your DB.
export function KanbanPageClient({ taskId }: { taskId?: string }) {
  const t = useTranslations()
  const router = useRouter()
  const [columns, setColumns] = useState<KanbanColumn[]>(() => createInitialColumns())

  return (
    <KanbanBoard
      columns={columns}
      onColumnsChange={setColumns}
      title={t('nav.items.kanban')}
      description="Track product work across releases, bugs, docs and customer onboarding."
      initialTaskId={taskId}
      // Deep link `/dashboard/kanban/<id>`: closing the sheet returns to the board URL.
      onDetailClose={taskId ? () => router.push('/dashboard/kanban') : undefined}
    />
  )
}
