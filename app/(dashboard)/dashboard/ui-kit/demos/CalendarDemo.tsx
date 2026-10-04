'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'

const toIsoDate = (d?: Date) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''

export default function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(() => new Date())

  return (
    <div className="flex flex-wrap items-start gap-4">
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      <p className="text-muted-foreground text-xs">
        Selected: <span className="text-foreground tabular-nums">{toIsoDate(date)}</span>
      </p>
    </div>
  )
}
