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
  LogIn,
  FolderPlus,
  MessageSquare,
  UserPlus,
  AlertCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { useLocale, useTranslations } from 'next-intl'
import { StatTile } from '@/components/blocks/StatTile'
import { DemoDataBanner } from '@/components/blocks/DemoDataBanner'
import type { ApiResponse } from '@/lib/api/response'
import { dateFromKey, isoDate, useMonthGrid } from '@/lib/use-month-grid'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

interface FeedItem {
  id: number
  userId: number | null
  action: string
  entity: string | null
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  actorEmail: string | null
}

function feedActionIcon(action: string) {
  if (action.startsWith('auth.')) return LogIn
  if (action.startsWith('projects.')) return FolderPlus
  if (action.startsWith('feedback.')) return MessageSquare
  if (action.startsWith('team.')) return UserPlus
  return ActivityIcon
}

function describeItem(item: FeedItem): string {
  const suffix = item.entity ? ` · ${item.entity}${item.entityId ? ` #${item.entityId}` : ''}` : ''
  return `${item.action}${suffix}`
}

function timeAgo(value: string, locale: string): string {
  const diffMs = new Date(value).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (Math.abs(diffMs) / 1000 < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
  const mins = Math.round(diffMs / 60000)
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
  const hours = Math.round(diffMs / 3600000)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(diffMs / 86400000)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  const months = Math.round(diffMs / 2592000000)
  if (Math.abs(months) < 12) return rtf.format(months, 'month')
  return rtf.format(Math.round(diffMs / 31536000000), 'year')
}

// 5-level intensity → one chart-2 opacity ramp (legend reuses it)
const intensityRamp = ['bg-muted/40', 'bg-chart-2/15', 'bg-chart-2/35', 'bg-chart-2/60', 'bg-chart-2/90'] as const
function intensityClass(n: number): string {
  if (n === 0) return intensityRamp[0]
  if (n < 5) return intensityRamp[1]
  if (n < 12) return intensityRamp[2]
  if (n < 20) return intensityRamp[3]
  return intensityRamp[4]
}

function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i)
  return Math.abs(h)
}

export function ActivityClient() {
  const t = useTranslations()
  const locale = useLocale()

  // Live audit feed: /api/activity. Empty (no DB / demo session) → the mock
  // heatmap stays as the fallback and the page shows the DemoDataBanner.
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [feedPending, setFeedPending] = useState(true)
  const [feedError, setFeedError] = useState(false)
  const refreshFeed = useCallback(async () => {
    setFeedPending(true)
    setFeedError(false)
    try {
      const res = await fetch('/api/activity', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ items: FeedItem[]; total: number }>
      if (json.ok) setFeedItems(json.data.items)
      else setFeedError(true)
    } catch {
      setFeedError(true)
    } finally {
      setFeedPending(false)
    }
  }, [])
  useEffect(() => {
    const timer = setTimeout(() => void refreshFeed(), 0)
    return () => clearTimeout(timer)
  }, [refreshFeed])
  const hasLive = feedItems.length > 0

  function formatFull(value: string): string {
    return new Date(value).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
  }

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
  } = useMonthGrid({ locale })

  function activityFor(key: string): number {
    if (key > todayKey) return 0
    const d = dateFromKey(key)
    const dow = d.getDay()
    const base = dow === 0 || dow === 6 ? 5 : 20
    const noise = (djb2(key) % 14) - 6
    return Math.max(0, base + noise)
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
    return dateFromKey(key).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <Page onMouseUp={endDrag}>
      <PageHeader>
        <PageHeaderHeading
          title={t('nav.items.activity')}
          description="Daily session heatmap. Drag or shift-click to summarize a range."
        />
      </PageHeader>
      <PageBody className="space-y-4">
        {!feedPending && !hasLive ? <DemoDataBanner /> : null}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Total this month" value={monthStats.total.toLocaleString(locale)} caption="sessions" icon={ActivityIcon} />
          <StatTile label="Avg per active day" value={String(monthStats.avg)} caption="sessions/day" icon={BarChart3} />
          <StatTile
            label="Peak day"
            value={String(monthStats.peak?.count ?? 0)}
            caption={monthStats.peak ? fmtKey(monthStats.peak.key) : '—'}
            icon={TrendingUp}
          />
          <StatTile
            label="Current streak"
            value={String(monthStats.streak)}
            caption={`day${monthStats.streak === 1 ? '' : 's'} in a row`}
            icon={Flame}
          />
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="size-8" aria-label="Previous month" onClick={prevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8" aria-label="Next month" onClick={nextMonth}>
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToToday}>
                Today
              </Button>
              <h2 className="ml-2 text-sm font-semibold">{monthLabel}</h2>
            </div>
            <div className="text-muted-foreground flex items-center gap-4 text-xs">
              {isRange ? (
                <div className="bg-primary/10 text-primary ring-primary/20 flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ring-inset">
                  <MousePointer2 className="size-3.5" aria-hidden="true" />
                  <span className="tabular-nums">
                    {rangeDayCount} days · {rangeStats.total.toLocaleString()} sessions · avg {rangeStats.avg}
                  </span>
                  <button type="button" className="hover:text-foreground ml-0.5" aria-label="Clear range" onClick={clearRange}>
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : null}
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" aria-hidden="true" />
                <span className="tabular-nums">{monthStats.total.toLocaleString()} this month</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/10 text-muted-foreground grid grid-cols-7 border-b text-xs font-medium tracking-wider uppercase">
            {weekdays.map((w) => (
              <div key={w} className="p-2">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 select-none">
            {monthCells.map((d, i) => (
              <button
                key={d.key}
                type="button"
                title={`${fmtKey(d.key)}: ${d.count} session${d.count === 1 ? '' : 's'}`}
                className={[
                  'group focus-visible:ring-ring relative isolate flex h-20 items-start justify-between border-r border-b p-1.5 text-left transition-all focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none',
                  (i + 1) % 7 === 0 && 'border-r-0',
                  i >= 35 && 'border-b-0',
                  !d.inMonth && 'opacity-40',
                  inRange(d.key) && 'ring-primary/60 z-10 ring-1 ring-inset',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(e) => onCellMouseDown(d.key, e)}
                onMouseEnter={() => onCellMouseEnter(d.key)}
              >
                <div
                  className={[
                    'pointer-events-none absolute inset-1 rounded-md transition-all group-hover:inset-0.5',
                    intensityClass(d.count),
                  ].join(' ')}
                />
                <span
                  className={[
                    'relative z-10 inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums',
                    d.key === todayKey ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground',
                  ].join(' ')}
                >
                  {d.date.getDate()}
                </span>
                {d.count > 0 && d.inMonth ? (
                  // WHY: focus-within joins hover so keyboard/touch
                  // users get the count too -- hover alone hides it from them.
                  <span className="text-foreground relative z-10 text-xs tabular-nums opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {d.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="bg-muted/20 text-muted-foreground flex flex-wrap items-center gap-2 border-t px-4 py-2 text-xs">
            <CalendarIcon className="size-3.5" aria-hidden="true" />
            <span>Less</span>
            {intensityRamp.map((cls) => (
              <span key={cls} className={`h-2.5 w-4 rounded-sm ${cls}`} />
            ))}
            <span>More</span>
            <span className="ml-auto">Drag or shift-click to summarize a range.</span>
          </div>
        </Card>

        {isRange ? (
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Selected range</p>
                <p className="mt-1 text-base font-semibold">
                  {fmtKey(rangeBounds.lo)} → {fmtKey(rangeBounds.hi)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-right">
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Days</p>
                  {/* WHY: KPI values sit on text-2xl so the range
                      summary matches the tile hierarchy. */}
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">{rangeDayCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Active</p>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">{rangeStats.active}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Total</p>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {rangeStats.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex h-12 items-end gap-0.5">
              {rangeStats.cells.map((c) => (
                <div
                  key={c.key}
                  title={`${fmtKey(c.key)}: ${c.count} sessions`}
                  className={['flex-1 rounded-sm transition-colors', c.count === 0 ? 'bg-muted/40' : 'bg-chart-2'].join(' ')}
                  style={{ height: c.count === 0 ? '8%' : `${Math.min(100, 12 + c.count * 4)}%` }}
                />
              ))}
            </div>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="border-b">
            {/* h2 (CardTitle renders h3): page outline goes h1 → h2. */}
            <h2 data-slot="card-title" className="text-base leading-tight font-semibold tracking-tight">
              {t('settings.activity.feed.title')}
            </h2>
          </CardHeader>
          {feedPending ? (
            <div className="text-muted-foreground px-4 py-3 text-sm">{t('settings.activity.states.loading')}</div>
          ) : feedError ? (
            <EmptyState icon={AlertCircle} role="alert" title={t('settings.activity.states.error')} className="py-4">
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void refreshFeed()}>
                {t('settings.activity.states.retry')}
              </Button>
            </EmptyState>
          ) : hasLive ? (
            <ul className="divide-y">
              {feedItems.map((item) => {
                const Icon = feedActionIcon(item.action)
                const actor = item.actorEmail ?? t('settings.activity.feed.deletedUser')
                return (
                  <li key={item.id} className="flex items-center gap-2 px-4 py-2">
                    <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" title={describeItem(item)}>
                        {describeItem(item)}
                      </p>
                      <p className="text-muted-foreground truncate text-xs" title={actor}>
                        {actor}
                      </p>
                    </div>
                    <time title={formatFull(item.createdAt)} className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {timeAgo(item.createdAt, locale)}
                    </time>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground px-4 py-3 text-sm">{t('settings.activity.states.empty')}</p>
          )}
        </Card>
      </PageBody>
    </Page>
  )
}