'use client'

import { BarChart } from '@/components/ui/charts/bar-chart'
import { GaugeChart } from '@/components/ui/charts/gauge-chart'
import { LineChart } from '@/components/ui/charts/line-chart'
import { Sparkline } from '@/components/ui/charts/sparkline'

const revenue = [
  { x: 'Apr', revenue: 42, expenses: 30 },
  { x: 'May', revenue: 48, expenses: 32 },
  { x: 'Jun', revenue: 51, expenses: 35 },
  { x: 'Jul', revenue: 58, expenses: 36 },
  { x: 'Aug', revenue: 63, expenses: 38 },
  { x: 'Sep', revenue: 71, expenses: 41 },
]
const deploys = [
  { x: 'Mon', y: 12 },
  { x: 'Tue', y: 18 },
  { x: 'Wed', y: 9 },
  { x: 'Thu', y: 21 },
  { x: 'Fri', y: 15 },
]
const spark = [4, 6, 5, 8, 7, 9, 12, 11, 14]
const yFields = ['revenue', 'expenses']

export default function ChartsDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">LineChart</p>
        <LineChart data={revenue} xField="x" yField={yFields} height={200} />
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">BarChart</p>
        <BarChart data={deploys} height={160} />
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">GaugeChart</p>
        <GaugeChart value={68} unit="%" height={160} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Sparkline</p>
        <Sparkline data={spark} height={36} />
      </div>
    </div>
  )
}
