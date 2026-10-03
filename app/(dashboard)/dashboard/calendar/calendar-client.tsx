'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  ArrowRight,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Copy,
  CopyPlus,
  Eye,
  Pencil,
  Plus,
  Clock,
  MapPin,
  Users,
  Search,
  CalendarDays,
  ListFilter,
  Sparkles,
  Trash2,
  X,
  MousePointer2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { KpiGrid } from '@/components/ui/kpi-grid'
import { StatTile } from '@/components/blocks/StatTile'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { dateFromKey, useMonthGrid } from '@/lib/use-month-grid'
import { demoEvents, typeMeta, type CalendarEvent } from '@/lib/calendar-demo-data'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

function EventContextMenu({
  event,
  children,
  onView,
  menuWidth = 'w-52',
  showCopyDate = true,
}: {
  event: CalendarEvent
  children: ReactNode
  onView: (e: CalendarEvent) => void
  menuWidth?: string
  showCopyDate?: boolean
}) {
  const meta = typeMeta[event.type]
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className={menuWidth}>
        <ContextMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={['size-1.5 rounded-full', meta.dot].join(' ')} />
          <span className="truncate">{event.title}</span>
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem className="gap-2" onSelect={() => onView(event)}>
          <Eye className="size-3.5" />
          View details
          <ContextMenuShortcut>↵</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem className="gap-2">
          <Pencil className="size-3.5" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem className="gap-2">
          <CopyPlus className="size-3.5" />
          Duplicate
        </ContextMenuItem>
        {showCopyDate ? (
          <ContextMenuItem className="gap-2" onSelect={() => copyDate(event.date)}>
            <Copy className="size-3.5" />
            Copy date
          </ContextMenuItem>
        ) : null}
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" className="gap-2">
          <Trash2 className="size-3.5" />
          Cancel event
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function copyDate(key: string) {
  navigator?.clipboard?.writeText(key).catch(() => undefined)
}

export function CalendarClient() {
  const t = useTranslations()
  const locale = useLocale()
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [eventOpen, setEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const events = demoEvents

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(t)
  }, [])

  const {
    todayKey,
    monthLabel,
    gridDays,
    weekdays,
    rangeBounds,
    rangeDayCount,
    isRange,
    inRange,
    rangeStart,
    prevMonth,
    nextMonth,
    goToToday,
    selectDay,
    selectWeekOf,
    clearRange,
    onCellMouseDown,
    onCellMouseEnter,
    endDrag,
    cursor,
  } = useMonthGrid({ initialDate: '2026-05-16', locale })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return events
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q),
    )
  }, [events, search])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    for (const arr of map.values()) arr.sort((a, b) => a.start.localeCompare(b.start))
    return map
  }, [filtered])

  const monthCounts = useMemo(() => {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    const init = { meeting: 0, task: 0, travel: 0, reminder: 0, total: 0 }
    for (const e of events) {
      const d = new Date(e.date)
      if (d.getFullYear() === y && d.getMonth() === m) {
        init[e.type]++
        init.total++
      }
    }
    return init
  }, [events, cursor])

  const typeStats = useMemo(() => {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    const out: Record<CalendarEvent['type'], { weeks: number[]; next: CalendarEvent | null }> = {
      meeting: { weeks: [0, 0, 0, 0, 0, 0], next: null },
      task: { weeks: [0, 0, 0, 0, 0, 0], next: null },
      reminder: { weeks: [0, 0, 0, 0, 0, 0], next: null },
      travel: { weeks: [0, 0, 0, 0, 0, 0], next: null },
    }
    const firstOffset = new Date(y, m, 1).getDay()
    for (const e of events) {
      const d = new Date(e.date)
      if (d.getFullYear() === y && d.getMonth() === m) {
        const week = Math.floor((d.getDate() - 1 + firstOffset) / 7)
        out[e.type].weeks[week]!++
      }
    }
    for (const t of Object.keys(out) as CalendarEvent['type'][]) {
      const sorted = events
        .filter((e) => e.type === t && e.date >= todayKey)
        .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
      out[t].next = sorted[0] ?? null
    }
    return out
  }, [events, cursor, todayKey])

  const rangeEvents = useMemo(() => {
    const { lo, hi } = rangeBounds
    return filtered
      .filter((e) => e.date >= lo && e.date <= hi)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
  }, [filtered, rangeBounds])

  const rangeTypeCounts = useMemo(() => {
    const init = { meeting: 0, task: 0, travel: 0, reminder: 0 }
    for (const e of rangeEvents) init[e.type]++
    return init
  }, [rangeEvents])

  const selectedDayEvents = eventsByDate.get(rangeStart) ?? []

  const upcoming = useMemo(
    () =>
      filtered
        .filter((e) => e.date > todayKey)
        .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
        .slice(0, 4),
    [filtered, todayKey],
  )

  function openEvent(e: CalendarEvent) {
    setSelectedEvent(e)
    setEventOpen(true)
  }

  // WHY: keyboard anchor for a day cell. The cell itself is a plain
  // <div> (no nested button) and each event chip is a real <button> -- Enter
  // on the focused cell anchors the single-day selection.
  function anchorDay(key: string) {
    selectDay(key)
  }

  function fmtNextDate(key: string) {
    if (key === todayKey) return 'Today'
    return dateFromKey(key).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  }

  function fmtDayLong(key: string) {
    return dateFromKey(key).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })
  }

  function fmtDayShort(key: string) {
    return dateFromKey(key).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  }

  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  function cellRangeClass(key: string, inMonth: boolean) {
    const { lo, hi } = rangeBounds
    if (!inRange(key)) return inMonth ? 'bg-background hover:bg-accent/40' : 'bg-muted/20 hover:bg-muted/30'
    if (key === lo && key === hi) return 'bg-accent/30 ring-1 ring-inset ring-primary/60'
    let cls = 'bg-primary/10 hover:bg-primary/15'
    if (key === lo || key === hi) cls += ' ring-1 ring-inset ring-primary/60'
    return cls
  }

  return (
    <Page onMouseUp={endDrag}>
      <PageHeader
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="h-8 w-56 pl-8 text-xs"
              />
            </div>
            <Select value={view} onValueChange={(v) => setView(v as typeof view)}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              New event
            </Button>
          </>
        }
      >
        <PageHeaderHeading
          title={t('nav.items.calendar')}
          description="Schedule, meetings, and deadlines. Drag or shift-click to select a range."
        />
      </PageHeader>
      <PageBody className="space-y-4">
        <KpiGrid>
          {(Object.keys(typeMeta) as CalendarEvent['type'][]).map((type) => {
            const meta = typeMeta[type]
            const next = typeStats[type].next
            return (
              <button
                key={type}
                type="button"
                className="focus-visible:ring-ring min-w-0 rounded-xl text-left focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setSearch(search.toLowerCase() === meta.label.toLowerCase() ? '' : meta.label.toLowerCase())}
              >
                <StatTile
                  label={meta.label}
                  value={String(monthCounts[type])}
                  caption="this month"
                  icon={meta.icon}
                  dotClass={meta.dot}
                  className="h-full"
                  footer={
                    next ? (
                      <>
                        <p className="uppercase tracking-wider">
                          Next · <span className={meta.text}>{fmtNextDate(next.date)}</span>
                        </p>
                        <p className="text-foreground mt-0.5 truncate font-medium" title={next.title}>{next.title}</p>
                      </>
                    ) : (
                      <>
                        <p className="uppercase tracking-wider">No upcoming</p>
                        <p className="mt-0.5">All clear</p>
                      </>
                    )
                  }
                >
                  <div className="mt-3 flex h-6 items-end gap-1">
                    {typeStats[type].weeks.slice(0, 6).map((n, i) => (
                      <span
                        key={i}
                        className={['flex-1 rounded-sm', n > 0 ? meta.bar : 'bg-muted/40'].join(' ')}
                        style={{ height: n > 0 ? `${Math.min(100, 30 + n * 35)}%` : '20%' }}
                        title={`Week ${i + 1}: ${n} ${meta.label.toLowerCase()}${n === 1 ? '' : 's'}`}
                      />
                    ))}
                  </div>
                </StatTile>
              </button>
            )
          })}
        </KpiGrid>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
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
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {isRange ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-primary ring-1 ring-inset ring-primary/20">
                    <MousePointer2 className="size-3" />
                    <span>
                      {rangeDayCount} days · {rangeEvents.length} events
                    </span>
                    <button type="button" className="ml-0.5 hover:text-foreground" onClick={clearRange}>
                      <X className="size-3" />
                    </button>
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3" />
                  <span>
                    {monthCounts.total} event{monthCounts.total === 1 ? '' : 's'} this month
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b bg-muted/10 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {weekdays.map((w) => (
                <div key={w} className="px-2 py-2 font-medium">
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 select-none">
              {loading
                ? Array.from({ length: 35 }, (_, i) => (
                    <div
                      key={i}
                      className={[
                        'h-24 border-b border-r p-1.5',
                        (i + 1) % 7 === 0 && 'border-r-0',
                        i >= 35 && 'border-b-0',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <Skeleton className="h-3 w-6" />
                      <Skeleton className="mt-2 h-3 w-full" />
                    </div>
                  ))
                : gridDays.map((d, i) => {
                    const dayEvents = eventsByDate.get(d.key) ?? []
                    const dayEventCount = dayEvents.length
                    return (
                      <ContextMenu key={d.key}>
                        <ContextMenuTrigger asChild>
                          {/* WHY: the cell is a plain div (role=group, never
                              a button) so the event chip inside can be a REAL button.
                              No nested interactives; the chip is keyboard reachable
                              by Tab and the cell anchors via Enter/Space. */}
                          <div
                            className={[
                              'group relative flex h-24 cursor-default flex-col gap-1 border-b border-r p-1.5 text-left transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              (i + 1) % 7 === 0 && 'border-r-0',
                              i >= 35 && 'border-b-0',
                              cellRangeClass(d.key, d.inMonth),
                              !d.inMonth && !inRange(d.key) && 'text-muted-foreground',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            tabIndex={0}
                            role="group"
                            aria-label={`${fmtDayLong(d.key)}: ${dayEventCount} events`}
                            onMouseDown={(e) => onCellMouseDown(d.key, e)}
                            onMouseEnter={() => onCellMouseEnter(d.key)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                anchorDay(d.key)
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={[
                                  'inline-flex size-5 items-center justify-center rounded-full text-xs tabular-nums',
                                  d.key === todayKey && 'bg-primary text-primary-foreground font-semibold',
                                  d.key !== todayKey && d.inMonth && 'text-foreground',
                                  !d.inMonth && 'text-muted-foreground',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              >
                                {d.date.getDate()}
                              </span>
                              {dayEventCount > 0 ? (
                                <span className="text-xs tabular-nums text-muted-foreground">{dayEventCount}</span>
                              ) : null}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              {dayEvents.slice(0, 2).map((e) => (
                                <EventContextMenu key={e.id} event={e} onView={openEvent}>
                                  <button
                                    type="button"
                                    className={[
                                      'focus-visible:ring-ring flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-xs ring-1 ring-inset cursor-pointer focus-visible:ring-2 focus-visible:outline-none',
                                      typeMeta[e.type].chip,
                                    ].join(' ')}
                                    title={`${e.start} – ${e.end} · ${e.title}`}
                                    aria-label={`${e.title}, ${e.start} – ${e.end}`}
                                    onMouseDown={(ev) => ev.stopPropagation()}
                                    onClick={(ev) => {
                                      ev.stopPropagation()
                                      openEvent(e)
                                    }}
                                    onContextMenu={(ev) => ev.stopPropagation()}
                                  >
                                    <span className="tabular-nums opacity-70">{e.start}</span>
                                    <span className="truncate">{e.title}</span>
                                  </button>
                                </EventContextMenu>
                              ))}
                              {dayEventCount > 2 ? (
                                <span className="px-1 text-xs text-muted-foreground">+{dayEventCount - 2} more</span>
                              ) : null}
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-56">
                          <ContextMenuLabel className="text-xs text-muted-foreground">{fmtDayLong(d.key)}</ContextMenuLabel>
                          <ContextMenuSeparator />
                          <ContextMenuItem className="gap-2">
                            <CalendarPlus className="size-3.5" />
                            New event
                            <ContextMenuShortcut>N</ContextMenuShortcut>
                          </ContextMenuItem>
                          <ContextMenuItem className="gap-2" onSelect={() => selectWeekOf(d.key)}>
                            <CalendarDays className="size-3.5" />
                            Select this week
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="gap-2"
                            disabled={dayEventCount === 0}
                            onSelect={() => selectDay(d.key)}
                          >
                            <Eye className="size-3.5" />
                            View day · {dayEventCount} event{dayEventCount === 1 ? '' : 's'}
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem className="gap-2" onSelect={() => copyDate(d.key)}>
                            <Copy className="size-3.5" />
                            Copy date
                            <ContextMenuShortcut className="tabular-nums">{d.key}</ContextMenuShortcut>
                          </ContextMenuItem>
                          <ContextMenuItem className="gap-2" onSelect={() => goToToday()}>
                            <ArrowRight className="size-3.5" />
                            Go to today
                          </ContextMenuItem>
                          {isRange ? (
                            <ContextMenuItem variant="destructive" className="gap-2" onSelect={() => clearRange()}>
                              <X className="size-3.5" />
                              Clear range
                            </ContextMenuItem>
                          ) : null}
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  })}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
              <ListFilter className="size-3" />
              {(Object.keys(typeMeta) as CalendarEvent['type'][]).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={['size-2 rounded-full', typeMeta[key].dot].join(' ')} />
                  {typeMeta[key].label}
                </div>
              ))}
              <span className="ml-auto">Tip: drag or shift-click to range. Right-click for actions.</span>
            </div>
          </Card>

          <aside className="flex flex-col gap-4">
            {!isRange ? (
              <Card>
                <div className="border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {rangeStart === todayKey ? 'Today' : 'Selected'}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold">{fmtDayLong(rangeStart)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Events</p>
                      <p className="text-sm font-semibold tabular-nums">{selectedDayEvents.length}</p>
                    </div>
                  </div>
                </div>
                <OverlayScroll className="max-h-[420px] p-3">
                  {loading ? (
                    Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="mb-2 space-y-2 rounded-lg p-3">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    ))
                  ) : selectedDayEvents.length === 0 ? (
                    <EmptyState icon={CalendarDays} title="Nothing scheduled" description="Click a date or add a new event.">
                      <Button size="sm" variant="outline" className="mt-3 gap-1.5 h-7 text-xs">
                        <Plus className="size-3" />
                        New event
                      </Button>
                    </EmptyState>
                  ) : (
                    selectedDayEvents.map((e) => (
                      <EventContextMenu key={e.id} event={e} onView={openEvent} menuWidth="w-48" showCopyDate={false}>
                        <div
                          className="group relative flex cursor-pointer gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/50"
                          onClick={() => openEvent(e)}
                        >
                          <div className={['w-0.5 shrink-0 rounded-full', typeMeta[e.type].bar].join(' ')} />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-tight">{e.title}</p>
                              <span
                                className={[
                                  'shrink-0 rounded px-1.5 py-0.5 text-xs uppercase tracking-wider ring-1 ring-inset',
                                  typeMeta[e.type].chip,
                                ].join(' ')}
                              >
                                {typeMeta[e.type].label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3" />
                                {e.start}–{e.end}
                              </span>
                              {e.location ? (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="size-3" />
                                  {e.location}
                                </span>
                              ) : null}
                            </div>
                            {e.attendees?.length ? (
                              <div className="flex items-center -space-x-1.5 pt-0.5">
                                {e.attendees.slice(0, 4).map((a, idx) => (
                                  <Avatar key={idx} className="size-5 border-2 border-background">
                                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                      {initials(a)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {e.attendees.length > 4 ? (
                                  <span className="pl-2 text-xs text-muted-foreground">+{e.attendees.length - 4}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </EventContextMenu>
                    ))
                  )}
                </OverlayScroll>
              </Card>
            ) : (
              <Card>
                <div className="border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Range · {rangeDayCount} days
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold">
                        {fmtDayShort(rangeBounds.lo)} → {fmtDayShort(rangeBounds.hi)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7" onClick={clearRange}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(Object.keys(typeMeta) as CalendarEvent['type'][]).map((t) => (
                      <div key={t} className="bg-muted rounded-md px-2 py-1.5">
                        <div className="flex min-w-0 items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                          <span className={['size-1.5 shrink-0 rounded-full', typeMeta[t].dot].join(' ')} />
                          <span className="truncate">{typeMeta[t].label}</span>
                        </div>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums">{rangeTypeCounts[t]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <OverlayScroll className="max-h-[420px]">
                  {rangeEvents.length === 0 ? (
                    <p className="p-4 text-center text-xs text-muted-foreground">No events in range.</p>
                  ) : (
                    rangeEvents.map((e) => (
                      <div
                        key={e.id}
                        className="flex cursor-pointer items-start gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0 hover:bg-accent/40"
                        onClick={() => openEvent(e)}
                      >
                        <div className="bg-muted flex w-10 shrink-0 flex-col items-center rounded-md px-1 py-1 text-center">
                          <span className="text-xs uppercase text-muted-foreground">
                            {new Date(e.date).toLocaleDateString(locale, { month: 'short' })}
                          </span>
                          <span className="text-sm font-semibold leading-none tabular-nums">
                            {new Date(e.date).getDate()}
                          </span>
                        </div>
                        <div className={['w-0.5 self-stretch shrink-0 rounded-full', typeMeta[e.type].bar].join(' ')} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium" title={e.title}>{e.title}</p>
                          <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                            {e.start}–{e.end}
                            {e.location ? ` · ${e.location}` : ''}
                          </p>
                        </div>
                        <span className={['shrink-0 rounded px-1.5 py-0.5 text-xs uppercase tracking-wider ring-1 ring-inset', typeMeta[e.type].chip].join(' ')}>
                          {typeMeta[e.type].label}
                        </span>
                      </div>
                    ))
                  )}
                </OverlayScroll>
              </Card>
            )}

            <Card>
              <div className="border-b bg-muted/30 px-4 py-2.5">
                <p className="text-sm font-semibold">Up next</p>
                <p className="text-xs text-muted-foreground">After today</p>
              </div>
              <div className="divide-y">
                {loading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="size-9 rounded-md" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                  ))
                ) : upcoming.length === 0 ? (
                  <p className="p-4 text-center text-xs text-muted-foreground">Nothing on the horizon.</p>
                ) : (
                  upcoming.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="group flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent/40"
                      onClick={() => openEvent(e)}
                    >
                        <div className="bg-muted flex size-10 shrink-0 flex-col items-center justify-center rounded-md text-center">
                          <span className="text-xs uppercase text-muted-foreground">
                            {new Date(e.date).toLocaleDateString(locale, { month: 'short' })}
                          </span>
                        <span className="text-sm font-semibold leading-none tabular-nums">
                          {new Date(e.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={['size-1.5 rounded-full', typeMeta[e.type].dot].join(' ')} />
                          <p className="truncate text-sm font-medium" title={e.title}>{e.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                          {e.start}–{e.end}
                          {e.location ? ` · ${e.location}` : ''}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </aside>
        </div>

        <Dialog open={eventOpen} onOpenChange={setEventOpen}>
          {selectedEvent ? (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className={['flex size-8 items-center justify-center rounded-md ring-1 ring-inset', typeMeta[selectedEvent.type].chip].join(' ')}>
                    {(() => {
                      const Icon = typeMeta[selectedEvent.type].icon
                      return <Icon className="size-4" />
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                    <DialogDescription className="text-xs">
                      {typeMeta[selectedEvent.type].label} · {selectedEvent.status}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                <Separator />
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span>
                      {selectedEvent.date} · {selectedEvent.start} – {selectedEvent.end}
                    </span>
                  </div>
                  {selectedEvent.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  ) : null}
                  {selectedEvent.attendees?.length ? (
                    <div className="flex items-start gap-2">
                      <Users className="size-4 text-muted-foreground mt-0.5" />
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectedEvent.attendees.map((a) => (
                          <div key={a} className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                            <Avatar className="size-4">
                              <AvatarFallback className="text-xs bg-muted text-muted-foreground">{initials(a)}</AvatarFallback>
                            </Avatar>
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button size="sm" variant="destructive">
                  Cancel event
                </Button>
              </DialogFooter>
            </DialogContent>
          ) : null}
        </Dialog>
      </PageBody>
    </Page>
  )
}