'use client'

import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { RangeCalendar } from '@/components/ui/range-calendar'

const toIsoDate = (d?: Date) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''

export default function RangeCalendarDemo() {
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    return { from: start, to: end }
  })

  return (
    <div className="flex flex-wrap items-start gap-4">
      <RangeCalendar selected={range} onSelect={setRange} className="rounded-md border" />
      <p className="text-muted-foreground text-xs">
        <span className="text-foreground tabular-nums">{toIsoDate(range?.from)}</span>
        {' to '}
        <span className="text-foreground tabular-nums">{toIsoDate(range?.to)}</span>
      </p>
    </div>
  )
}
