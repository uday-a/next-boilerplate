'use client'

import { cn } from '@/lib/utils'

interface UsageBarProps {
  label: string
  used: number
  limit: number
  /** Pre-formatted "used / limit" text; defaults to locale numbers. */
  valueText?: string
  /** Muted qualifier next to the label ("this month", "workspace total"). */
  scope?: string
  className?: string
}

/**
 * One usage meter for Billing and Limits. Colour follows a single
 * threshold rule: < 70% neutral, 70-89% warning, >= 90% destructive.
 * Port of Nuxt `UsageBar.vue`.
 */
export function UsageBar({ label, used, limit, valueText, scope, className }: UsageBarProps) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const tone = pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-warning' : 'bg-primary'
  const text = valueText ?? `${used.toLocaleString()} / ${limit.toLocaleString()}`

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">
          {label}
          {scope ? <span className="text-muted-foreground ml-1 text-xs font-normal">{scope}</span> : null}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {text}{' '}
          <span className={pct >= 90 ? 'text-destructive font-medium' : pct >= 70 ? 'text-warning font-medium' : ''}>
            ({pct}%)
          </span>
        </span>
      </div>
      <div
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-200', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
