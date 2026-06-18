'use client'

import { useState } from 'react'
import { KanbanBoard } from '@/components/blocks/kanban-board/KanbanBoard'
import { createInitialColumns } from '@/lib/kanban-data'
import type { KanbanColumn } from '@/lib/use-kanban'

export function KanbanPageClient() {
  const [columns, setColumns] = useState<KanbanColumn[]>(() => createInitialColumns())

  return (
    <KanbanBoard
      columns={columns}
      onColumnsChange={setColumns}
      title="Project board"
      description="Demo board seeded from the registry's kanban-data lib. Swap createInitialColumns() for a real fetcher when wiring to your DB."
    />
  )
}