'use client'

import { Progress } from '@/components/ui/progress'

const rows = [
  { label: 'Uploading', value: 78 },
  { label: 'Processing', value: 42 },
  { label: 'Complete', value: 100 },
]

export default function ProgressDemo() {
  return (
    <div className="space-y-4">
      {rows.map(row => (
        <div key={row.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{row.label}</span>
            <span className="tabular-nums">{row.value}%</span>
          </div>
          <Progress value={row.value} aria-label={row.label} />
        </div>
      ))}
    </div>
  )
}
