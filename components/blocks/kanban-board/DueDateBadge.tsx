'use client'

import { AlertCircle, Clock } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { getDueStatus, formatDueDate } from '@/lib/use-kanban'

export function DueDateBadge({
  dueDate,
  variant,
  className,
}: {
  dueDate: string
  variant?: 'chip' | 'inline'
  className?: string
}) {
  const t = useTranslations('dashboard.kanban')
  const locale = useLocale()
  const status = getDueStatus(dueDate)
  const date = formatDueDate(dueDate, locale)
  // WHY: overdue/soon must not rely on colour alone -- icon and text change too.
  const formatted =
    status === 'overdue' ? t('dueOverdue', { date }) : status === 'soon' ? t('dueSoon', { date }) : date
  const Icon = status === 'overdue' ? AlertCircle : Clock

  const chipClasses =
    status === 'overdue'
      ? 'bg-destructive/10 text-destructive'
      : status === 'soon'
        ? 'bg-warning/10 text-warning'
        : 'text-muted-foreground bg-muted'

  const inlineClasses =
    status === 'overdue' ? 'text-destructive' : status === 'soon' ? 'text-warning' : 'text-foreground'

  if (variant === 'chip') {
    return (
      <div
        className={cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium', chipClasses, className)}
      >
        <Icon className="size-3" aria-hidden="true" />
        {formatted}
      </div>
    )
  }

  return (
    <p className={cn('flex items-center gap-1 text-sm leading-tight font-medium', inlineClasses, className)}>
      <Icon className="size-3" aria-hidden="true" />
      {formatted}
    </p>
  )
}