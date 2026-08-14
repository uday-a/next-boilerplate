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
        <CardDescription className="text-xs font-medium uppercase tracking-wider flex items-center justify-between">
          {label}
          {Icon ? <Icon className={['size-4 text-muted-foreground', iconClassName].filter(Boolean).join(' ')} /> : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight tabular-nums">{value}</span>
          {delta ? (
            <span
              className={[
                'text-xs font-semibold',
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
