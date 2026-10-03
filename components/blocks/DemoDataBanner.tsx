'use client'

import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The single place a page admits it's showing sample data. Replaces the
 * scattered implementation notes that used to sit in page copy.
 * Port of Nuxt `DemoDataBanner.vue`.
 */
export function DemoDataBanner({
  message = 'Sample data. Connect a database to see live records.',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-xs',
        className,
      )}
      role="note"
    >
      <Info className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
