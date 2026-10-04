'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export type DateKey = string

export interface UseMonthGridOptions {
  initialDate?: Date | DateKey
  weekStartsOn?: 0 | 1
  /** BCP-47 locale for the month label (defaults to en-US). */
  locale?: string
}

export function isoDate(d: Date): DateKey {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateFromKey(k: DateKey): Date {
  return new Date(`${k}T00:00:00`)
}

export function dayDiff(a: DateKey, b: DateKey): number {
  return Math.round((dateFromKey(b).getTime() - dateFromKey(a).getTime()) / 86400000)
}

export function useMonthGrid(options: UseMonthGridOptions = {}) {
  const weekStartsOn = options.weekStartsOn ?? 0
  // "today" is frozen to the first render so it stays stable across renders.
  const [init] = useState(() =>
    options.initialDate != null
      ? typeof options.initialDate === 'string'
        ? dateFromKey(options.initialDate)
        : options.initialDate
      : new Date(),
  )

  const [today] = useState(() => new Date(init.getFullYear(), init.getMonth(), init.getDate()))
  const todayKey = isoDate(today)

  const [cursor, setCursor] = useState(() => new Date(init.getFullYear(), init.getMonth(), 1))
  const [rangeAnchor, setRangeAnchor] = useState<DateKey>(todayKey)
  const [rangeStart, setRangeStart] = useState<DateKey>(todayKey)
  const [rangeEnd, setRangeEnd] = useState<DateKey>(todayKey)
  const [isDragging, setIsDragging] = useState(false)

  const monthLabel = useMemo(
    () => cursor.toLocaleDateString(options.locale ?? 'en-US', { month: 'long', year: 'numeric' }),
    [cursor, options.locale],
  )

  const gridDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - offset)
    const days: { date: Date; key: DateKey; inMonth: boolean }[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push({
        date: d,
        key: isoDate(d),
        inMonth: d.getMonth() === cursor.getMonth(),
      })
    }
    return days
  }, [cursor, weekStartsOn])

  const weekdays = useMemo(() => {
    // Short weekday names in the active locale. Jan 4 2026 is a Sunday,
    // so Jan 4–10 walks Sun..Sat regardless of locale.
    const names = Array.from({ length: 7 }, (_, i) =>
      new Date(2026, 0, 4 + i).toLocaleDateString(options.locale ?? 'en-US', { weekday: 'short' }),
    )
    return [...names.slice(weekStartsOn), ...names.slice(0, weekStartsOn)]
  }, [weekStartsOn, options.locale])

  const rangeBounds = useMemo(() => {
    const a = rangeStart
    const b = rangeEnd
    return a <= b ? { lo: a, hi: b } : { lo: b, hi: a }
  }, [rangeStart, rangeEnd])

  const rangeDayCount = useMemo(() => dayDiff(rangeBounds.lo, rangeBounds.hi) + 1, [rangeBounds])
  const isRange = useMemo(() => rangeBounds.lo !== rangeBounds.hi, [rangeBounds])

  const inRange = useCallback(
    (key: DateKey) => key >= rangeBounds.lo && key <= rangeBounds.hi,
    [rangeBounds],
  )

  const prevMonth = useCallback(() => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
  }, [])

  const nextMonth = useCallback(() => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
  }, [])

  const goToToday = useCallback(() => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setRangeAnchor(todayKey)
    setRangeStart(todayKey)
    setRangeEnd(todayKey)
  }, [today, todayKey])

  const selectDay = useCallback((key: DateKey) => {
    setRangeAnchor(key)
    setRangeStart(key)
    setRangeEnd(key)
  }, [])

  const selectWeekOf = useCallback(
    (key: DateKey) => {
      const d = dateFromKey(key)
      const dow = (d.getDay() - weekStartsOn + 7) % 7
      const wkStart = new Date(d)
      wkStart.setDate(d.getDate() - dow)
      const wkEnd = new Date(wkStart)
      wkEnd.setDate(wkStart.getDate() + 6)
      const lo = isoDate(wkStart)
      const hi = isoDate(wkEnd)
      setRangeAnchor(lo)
      setRangeStart(lo)
      setRangeEnd(hi)
    },
    [weekStartsOn],
  )

  const clearRange = useCallback(() => {
    setRangeAnchor(todayKey)
    setRangeStart(todayKey)
    setRangeEnd(todayKey)
  }, [todayKey])

  const onCellMouseDown = useCallback((key: DateKey, ev: React.MouseEvent) => {
    if (ev.button !== 0) return
    if (ev.shiftKey) {
      setRangeEnd(key)
      return
    }
    setRangeAnchor(key)
    setRangeStart(key)
    setRangeEnd(key)
    setIsDragging(true)
  }, [])

  const onCellMouseEnter = useCallback(
    (key: DateKey) => {
      if (!isDragging) return
      setRangeEnd(key)
      setRangeStart(rangeAnchor)
    },
    [isDragging, rangeAnchor],
  )

  const endDrag = useCallback(() => {
    setIsDragging((d) => (d ? false : d))
  }, [])

  useEffect(() => {
    window.addEventListener('mouseup', endDrag)
    window.addEventListener('mouseleave', endDrag)
    return () => {
      window.removeEventListener('mouseup', endDrag)
      window.removeEventListener('mouseleave', endDrag)
    }
  }, [endDrag])

  return {
    today,
    todayKey,
    cursor,
    monthLabel,
    gridDays,
    weekdays,
    rangeAnchor,
    rangeStart,
    rangeEnd,
    rangeBounds,
    rangeDayCount,
    isRange,
    isDragging,
    inRange,
    prevMonth,
    nextMonth,
    goToToday,
    selectDay,
    selectWeekOf,
    clearRange,
    onCellMouseDown,
    onCellMouseEnter,
    endDrag,
    setRangeAnchor,
    setRangeStart,
    setRangeEnd,
  }
}