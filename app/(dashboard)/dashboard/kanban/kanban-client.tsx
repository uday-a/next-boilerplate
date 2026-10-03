'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { KanbanBoard } from '@/components/blocks/kanban-board/KanbanBoard'
import { createInitialColumns } from '@/lib/kanban-data'
import type { KanbanColumn } from '@/lib/use-kanban'

export function KanbanPageClient() {
  const t = useTranslations()
  const [columns, setColumns] = useState<KanbanColumn[]>(() => createInitialColumns())

  return (
    <KanbanBoard
      columns={columns}
      onColumnsChange={setColumns}
      title={t('nav.items.kanban')}
      description="Demo board seeded from the registry's kanban-data lib. Swap createInitialColumns() for a real fetcher when wiring to your DB."
    />
  )
}