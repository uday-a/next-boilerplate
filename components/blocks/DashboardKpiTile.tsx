import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

export interface DashboardKpiTileProps {
  label: string
  value: string
  delta?: string
  deltaTone?: 'positive' | 'negative'
  icon?: LucideIcon
  iconClassName?: string
  children?: React.ReactNode
}

export function DashboardKpiTile({
  label,
  value,
  delta,
  deltaTone = 'positive',
  icon: Icon,
  iconClassName,
  children,
}: DashboardKpiTileProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-[10px] uppercase tracking-wider flex items-center justify-between">
          {label}
          {Icon ? <Icon className={['size-3', iconClassName].filter(Boolean).join(' ')} /> : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-semibold tabular-nums">{value}</span>
          {delta ? (
            <span
              className={[
                'text-[11px] font-medium',
                deltaTone === 'negative' ? 'text-rose-600' : 'text-emerald-600',
              ].join(' ')}
            >
              {delta}
            </span>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}