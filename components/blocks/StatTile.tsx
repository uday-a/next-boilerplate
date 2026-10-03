'use client'

import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Info, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string
  delta?: string
  /** Tone for the delta string. Default 'positive'. Use 'negative' when up = bad. */
  deltaTone?: 'positive' | 'negative'
  caption?: string
  icon?: LucideIcon
  /** Category dot before the label, e.g. 'bg-chart-1'. */
  dotClass?: string
  // WHY: optional formula/grain note rendered as an info tooltip
  // next to the label so a KPI's definition is one hover away.
  definition?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/**
 * The app's one stat tile. Every KPI strip (dashboard, calendar,
 * activity, locations) uses this so label, number and delta read the
 * same everywhere. Port of Nuxt `StatTile.vue`.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaTone = 'positive',
  caption,
  icon: Icon,
  dotClass,
  definition,
  children,
  footer,
  className,
}: StatTileProps) {
  // WHY: color never carries direction alone -- a shape
  // (TrendingUp/TrendingDown) rides next to the delta. Sign is read from the
  // string ('-', '−' and '↓' count as down); tone only picks the color.
  const deltaDown = (delta ?? '').trim().startsWith('-')
    || (delta ?? '').trim().startsWith('−')
    || (delta ?? '').trim().startsWith('↓')
  const DeltaIcon = deltaDown ? TrendingDown : TrendingUp
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="px-4 pt-4 pb-1">
        <CardDescription className="text-muted-foreground flex items-center justify-between gap-2 text-xs font-medium tracking-wider uppercase">
          <span className="flex min-w-0 items-center gap-1.5">
            {dotClass ? <span className={cn('size-2 shrink-0 rounded-full', dotClass)} aria-hidden="true" /> : null}
            <span className="truncate" title={label}>{label}</span>
            {definition ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 items-center rounded focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={`${label} definition`}
                    >
                      <Info className="size-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-56 text-xs">
                    {definition}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </span>
          {Icon ? <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" /> : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-4 pb-4">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
          {delta ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
                deltaTone === 'negative' ? 'text-destructive' : 'text-success',
              )}
            >
              <DeltaIcon className="size-3" aria-hidden="true" />
              {delta}
            </span>
          ) : null}
        </div>
        {caption ? <p className="text-muted-foreground mt-0.5 text-xs">{caption}</p> : null}
        {children}
        {footer ? <div className="text-muted-foreground mt-auto pt-3 text-xs">{footer}</div> : null}
      </CardContent>
    </Card>
  )
}
