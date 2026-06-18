'use client'

import {
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  MousePointer2,
  Activity as ActivityIcon,
  Calendar as CalendarIcon,
  X,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dateFromKey, isoDate, useMonthGrid } from '@/lib/use-month-grid'

function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i)
  return Math.abs(h)
}

export default function ActivityPage() {
  const {
    monthLabel,
    gridDays,
    weekdays,
    rangeBounds,
    rangeDayCount,
    isRange,
    inRange,
    prevMonth,
    nextMonth,
    goToToday,
    clearRange,
    onCellMouseDown,
    onCellMouseEnter,
    endDrag,
    todayKey,
  } = useMonthGrid()

  function activityFor(key: string): number {
    if (key > todayKey) return 0
    const d = dateFromKey(key)
    const dow = d.getDay()
    const base = dow === 0 || dow === 6 ? 5 : 20
    const noise = (djb2(key) % 14) - 6
    return Math.max(0, base + noise)
  }

  function intensityClass(n: number): string {
    if (n === 0) return 'bg-muted/40'
    if (n < 5) return 'bg-emerald-500/15'
    if (n < 12) return 'bg-emerald-500/35'
    if (n < 20) return 'bg-emerald-500/60'
    return 'bg-emerald-500/85'
  }

  const monthCells = gridDays.map((d) => ({ ...d, count: activityFor(d.key) }))
  const inMonth = monthCells.filter((c) => c.inMonth)
  const total = inMonth.reduce((acc, c) => acc + c.count, 0)
  const nonZero = inMonth.filter((c) => c.count > 0)
  const peak = inMonth.reduce<{ key: string; count: number } | null>(
    (best, c) => (best === null || c.count > best.count ? { key: c.key, count: c.count } : best),
    null,
  )
  const avg = nonZero.length ? Math.round(total / nonZero.length) : 0

  let streak = 0
  const cursorDate = dateFromKey(todayKey)
  for (let i = 0; i < 365; i++) {
    const d = new Date(cursorDate)
    d.setDate(cursorDate.getDate() - i)
    if (activityFor(isoDate(d)) > 0) streak++
    else break
  }

  const monthStats = { total, avg, peak, streak }

  const start = dateFromKey(rangeBounds.lo)
  const rangeCells: { key: string; count: number }[] = []
  for (let i = 0; i < rangeDayCount; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = isoDate(d)
    rangeCells.push({ key, count: activityFor(key) })
  }
  const rangeTotal = rangeCells.reduce((a, c) => a + c.count, 0)
  const rangeActive = rangeCells.filter((c) => c.count > 0).length
  const rangeAvg = rangeDayCount > 0 ? Math.round(rangeTotal / rangeDayCount) : 0
  const rangeStats = { total: rangeTotal, avg: rangeAvg, active: rangeActive, cells: rangeCells }

  function fmtKey(key: string) {
    return dateFromKey(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col gap-5" onMouseUp={endDrag}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-muted-foreground text-sm">
            Daily session heatmap. Drag or shift-click to summarize a range.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: ActivityIcon, label: 'Total · this month', value: monthStats.total.toLocaleString(), sub: 'sessions', color: 'text-emerald-600 dark:text-emerald-400' },
          { icon: BarChart3, label: 'Avg · active day', value: String(monthStats.avg), sub: 'sessions/day', color: 'text-sky-600 dark:text-sky-400' },
          { icon: TrendingUp, label: 'Peak day', value: String(monthStats.peak?.count ?? 0), sub: monthStats.peak ? fmtKey(monthStats.peak.key) : '—', color: 'text-violet-600 dark:text-violet-400' },
          { icon: Flame, label: 'Current streak', value: String(monthStats.streak), sub: `day${monthStats.streak === 1 ? '' : 's'} in a row`, color: 'text-amber-600 dark:text-amber-400' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="relative overflow-hidden rounded-xl border bg-card p-4">
              <div className="flex items-center gap-1.5">
                <Icon className={`size-3.5 ${kpi.color}`} />
                <p className="text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground">{kpi.label}</p>
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums leading-none">{kpi.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground truncate">{kpi.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-7" onClick={prevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-7" onClick={nextMonth}>
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToToday}>
              Today
            </Button>
            <h2 className="text-sm font-semibold ml-2">{monthLabel}</h2>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {isRange ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-800 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-300">
                <MousePointer2 className="size-3" />
                <span>
                  {rangeDayCount} days · {rangeStats.total.toLocaleString()} sessions · avg {rangeStats.avg}
                </span>
                <button type="button" className="ml-0.5 hover:text-foreground" onClick={clearRange}>
                  <X className="size-3" />
                </button>
              </div>
            ) : null}
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3" />
              <span>{monthStats.total.toLocaleString()} this month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/10 text-[10px] uppercase tracking-wider text-muted-foreground">
          {weekdays.map((w) => (
            <div key={w} className="px-2 py-2 font-medium">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 select-none">
          {monthCells.map((d, i) => (
            <button
              key={d.key}
              type="button"
              title={`${fmtKey(d.key)} — ${d.count} session${d.count === 1 ? '' : 's'}`}
              className={[
                'group relative isolate flex h-20 items-start justify-between border-b border-r p-1.5 text-left transition-all focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                (i + 1) % 7 === 0 && 'border-r-0',
                i >= 35 && 'border-b-0',
                !d.inMonth && 'opacity-40',
                inRange(d.key) && 'ring-1 ring-inset ring-emerald-500/60 z-10',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseDown={(e) => onCellMouseDown(d.key, e)}
              onMouseEnter={() => onCellMouseEnter(d.key)}
            >
              <div
                className={[
                  'pointer-events-none absolute inset-1 rounded-md transition-all group-hover:brightness-125 group-hover:inset-0.5',
                  intensityClass(d.count),
                ].join(' ')}
              />
              <span
                className={[
                  'relative inline-flex size-5 items-center justify-center rounded-full text-[11px] tabular-nums z-10',
                  d.key === todayKey && 'bg-foreground text-background font-semibold ring-2 ring-emerald-400',
                  d.key !== todayKey && d.inMonth && 'text-foreground/80',
                  !d.inMonth && 'text-foreground/40',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {d.date.getDate()}
              </span>
              {d.count > 0 && d.inMonth ? (
                <span className="relative z-10 text-[10px] tabular-nums text-foreground/70 opacity-0 transition-opacity group-hover:opacity-100">
                  {d.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground">
          <CalendarIcon className="size-3" />
          <span>Less</span>
          <span className="h-2.5 w-4 rounded-sm bg-muted/40" />
          <span className="h-2.5 w-4 rounded-sm bg-emerald-500/15" />
          <span className="h-2.5 w-4 rounded-sm bg-emerald-500/35" />
          <span className="h-2.5 w-4 rounded-sm bg-emerald-500/60" />
          <span className="h-2.5 w-4 rounded-sm bg-emerald-500/85" />
          <span>More</span>
          <span className="ml-auto">Tip: drag or shift-click to summarize a range.</span>
        </div>
      </div>

      {isRange ? (
        <div className="rounded-xl border bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground">Selected range</p>
              <p className="mt-1 text-base font-semibold">
                {fmtKey(rangeBounds.lo)} → {fmtKey(rangeBounds.hi)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Days</p>
                <p className="text-lg font-semibold tabular-nums">{rangeDayCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</p>
                <p className="text-lg font-semibold tabular-nums">{rangeStats.active}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {rangeStats.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-0.5 h-12">
            {rangeStats.cells.map((c) => (
              <div
                key={c.key}
                title={`${fmtKey(c.key)} — ${c.count}`}
                className={['flex-1 rounded-sm transition-colors', c.count === 0 ? 'bg-muted/30' : 'bg-emerald-500/70'].join(' ')}
                style={{ height: c.count === 0 ? '8%' : `${Math.min(100, 12 + c.count * 4)}%` }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}