'use client'

import { cn } from '@/lib/utils'

export function TagBadge({ label, color, className }: { label: string; color: string; className?: string }) {
  return (
    <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset', color, className)}>
      {label}
    </span>
  )
}