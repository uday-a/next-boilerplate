'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CopyPlus,
  Eye,
  ListFilter,
  MapPin,
  MousePointer2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'
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
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
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
import { cn } from '@/lib/utils'
import { dateFromKey, useMonthGrid } from '@/lib/use-month-grid'
import { createDemoEvents, typeMeta, type CalendarEvent } from '@/lib/calendar-demo-data'

type TypeKey = CalendarEvent['type']
const typeKeys = Object.keys(typeMeta) as TypeKey[]

function copyDate(key: string) {
  navigator?.clipboard?.writeText(key).catch(() => undefined)
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
}

function timeRange(e: CalendarEvent) {
  return e.start === e.end ? e.start : `${e.start}–${e.end}`
}

export function CalendarClient() {
  const t = useTranslations()
  const locale = useLocale()
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [eventOpen, setEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [search, setSearch] = useState('')

  // Headless month-grid + range-select state and handlers. Opens on today.
  const {
    todayKey,
    cursor,
    monthLabel,
    gridDays,
    weekdays,
    rangeStart,
    rangeBounds,
    rangeDayCount,
    isRange,
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
  } = useMonthGrid({ locale })

  const events = useMemo(() => createDemoEvents(todayKey), [todayKey])

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
      const d = dateFromKey(e.date)
      if (d.getFullYear() === y && d.getMonth() === m) {
        init[e.type]++
        init.total++
      }
    }
    return init
  }, [events, cursor])

  // Next upcoming event per type (from today onward, not just this month).
  const nextByType = useMemo(() => {
    const out = {} as Record<TypeKey, CalendarEvent | null>
    for (const type of typeKeys) {
      const sorted = events
        .filter((e) => e.type === type && e.date >= todayKey)
        .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
      out[type] = sorted[0] ?? null
    }
    return out
  }, [events, todayKey])

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

  // Cells fit two chips. With three or more events, show one chip and
  // "+N more" so the chip keeps room for its time line.
  function visibleEvents(key: string) {
    const list = eventsByDate.get(key) ?? []
    return list.slice(0, list.length > 2 ? 1 : 2)
  }

  function openEvent(e: CalendarEvent) {
    setSelectedEvent(e)
    setEventOpen(true)
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
  function fmtMonthShort(key: string) {
    return dateFromKey(key).toLocaleDateString(locale, { month: 'short' })
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
      {/* Actions go straight into PageHeader's flex-wrap bar (no shrink-0
          wrapper), so they wrap instead of overflowing at 375px. */}
      <PageHeader
        actions={
          <>
            <div className="w-56">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                placeholder="Search events…"
                prefixIcon={<Search className="size-4" aria-hidden="true" />}
              />
            </div>
            <Select value={view} onValueChange={(v) => setView(v as typeof view)}>
              <SelectTrigger size="sm" className="w-24 text-xs">
                <SelectValue>{view.charAt(0).toUpperCase() + view.slice(1)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="size-4" aria-hidden="true" />
              New event
            </Button>
          </>
        }
      >
        <PageHeaderHeading
          title={t('nav.items.calendar')}
          description="Schedule, meetings and deadlines. Drag or shift-click to select a range."
        />
      </PageHeader>

      <PageBody className="space-y-4">
        {/* Stats strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {typeKeys.map((type) => {
            const meta = typeMeta[type]
            const next = nextByType[type]
            return (
              <StatTile
                key={type}
                label={meta.label}
                value={String(monthCounts[type])}
                caption="this month"
                dotClass={meta.dot}
                footer={
                  next ? (
                    <p className="truncate" title={`Next: ${fmtNextDate(next.date)} · ${next.title}`}>
                      Next: {fmtNextDate(next.date)} · <span className="text-foreground font-medium">{next.title}</span>
                    </p>
                  ) : (
                    <p>Nothing upcoming</p>
                  )
                }
              />
            )
          })}
        </div>

        {/* Main: calendar + side rail */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Month grid */}
          <Card className="lg:col-span-2">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="size-7" aria-label="Previous month" onClick={prevMonth}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-7" aria-label="Next month" onClick={nextMonth}>
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
                      {rangeDayCount} days · {rangeEvents.length} events
                    </span>
                    <button type="button" className="hover:text-foreground ml-0.5" aria-label="Clear range" onClick={clearRange}>
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span className="tabular-nums">
                    {monthCounts.total} event{monthCounts.total === 1 ? '' : 's'} this month
                  </span>
                </div>
              </div>
            </div>

            {/* Weekday header */}
            <div className="bg-muted/10 text-muted-foreground grid grid-cols-7 border-b text-xs font-medium tracking-wider uppercase">
              {weekdays.map((w) => (
                <div key={w} className="p-2">
                  {w}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 select-none">
              {gridDays.map((d, i) => {
                const dayEvents = eventsByDate.get(d.key) ?? []
                const visible = visibleEvents(d.key)
                return (
                  <ContextMenu key={d.key}>
                    <ContextMenuTrigger asChild>
                      {/* WHY: the cell is a plain div (role=group, never a button)
                          so the event chip inside can be a REAL button. No nested
                          interactives; the cell anchors via Enter/Space. */}
                      <div
                        className={cn(
                          'group focus-visible:ring-ring relative flex h-28 min-w-0 cursor-default flex-col gap-1 border-r border-b p-1.5 text-left transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none',
                          (i + 1) % 7 === 0 && 'border-r-0',
                          i >= 35 && 'border-b-0',
                          cellRangeClass(d.key, d.inMonth),
                        )}
                        tabIndex={0}
                        role="group"
                        aria-label={`${fmtDayLong(d.key)}: ${dayEvents.length} events`}
                        onMouseDown={(e) => onCellMouseDown(d.key, e)}
                        onMouseEnter={() => onCellMouseEnter(d.key)}
                        onKeyDown={(e) => {
                          if (e.target !== e.currentTarget) return
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            selectDay(d.key)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              'inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums',
                              d.key === todayKey && 'bg-primary text-primary-foreground font-semibold',
                              d.key !== todayKey && d.inMonth && 'text-foreground',
                              !d.inMonth && 'text-muted-foreground',
                            )}
                          >
                            {d.date.getDate()}
                          </span>
                          {dayEvents.length > 0 ? (
                            <span className="text-muted-foreground text-xs tabular-nums">{dayEvents.length}</span>
                          ) : null}
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          {visible.map((e) => (
                            <ContextMenu key={e.id}>
                              <ContextMenuTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    'focus-visible:ring-ring flex w-full min-w-0 cursor-pointer flex-col rounded-sm border-l-2 px-1 py-0.5 text-left text-xs leading-4 focus-visible:ring-2 focus-visible:outline-none',
                                    typeMeta[e.type].chip,
                                  )}
                                  title={`${timeRange(e)} · ${e.title}`}
                                  aria-label={`${e.title}, ${timeRange(e)}`}
                                  onMouseDown={(ev) => ev.stopPropagation()}
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    openEvent(e)
                                  }}
                                  onContextMenu={(ev) => ev.stopPropagation()}
                                >
                                  <span className="truncate font-medium">{e.title}</span>
                                  <span className="text-muted-foreground tabular-nums">{e.start}</span>
                                </button>
                              </ContextMenuTrigger>
                              <ContextMenuContent className="w-52">
                                <ContextMenuLabel className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                  <span className={cn('size-2 shrink-0 rounded-full', typeMeta[e.type].dot)} />
                                  <span className="truncate">{e.title}</span>
                                </ContextMenuLabel>
                                <ContextMenuSeparator />
                                <ContextMenuItem onSelect={() => openEvent(e)}>
                                  <Eye /> View details
                                  <ContextMenuShortcut>↵</ContextMenuShortcut>
                                </ContextMenuItem>
                                <ContextMenuItem>
                                  <Pencil /> Edit
                                </ContextMenuItem>
                                <ContextMenuItem>
                                  <CopyPlus /> Duplicate
                                </ContextMenuItem>
                                <ContextMenuItem onSelect={() => copyDate(e.date)}>
                                  <Copy /> Copy date
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem variant="destructive">
                                  <Trash2 /> Cancel event
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          ))}
                          {dayEvents.length > visible.length ? (
                            <span className="text-muted-foreground px-1 text-xs">
                              +{dayEvents.length - visible.length} more
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuLabel className="text-muted-foreground text-xs">{fmtDayLong(d.key)}</ContextMenuLabel>
                      <ContextMenuSeparator />
                      <ContextMenuItem>
                        <CalendarPlus /> New event
                        <ContextMenuShortcut>N</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={() => selectWeekOf(d.key)}>
                        <CalendarDays /> Select this week
                      </ContextMenuItem>
                      <ContextMenuItem disabled={dayEvents.length === 0} onSelect={() => selectDay(d.key)}>
                        <Eye /> View day · {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onSelect={() => copyDate(d.key)}>
                        <Copy /> Copy date <ContextMenuShortcut className="tabular-nums">{d.key}</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={goToToday}>
                        <ArrowRight /> Go to today
                      </ContextMenuItem>
                      {isRange ? (
                        <ContextMenuItem variant="destructive" onSelect={clearRange}>
                          <X /> Clear range
                        </ContextMenuItem>
                      ) : null}
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}
            </div>

            {/* Legend */}
            <div className="bg-muted/20 text-muted-foreground flex flex-wrap items-center gap-4 border-t px-4 py-2 text-xs">
              <ListFilter className="size-3.5" aria-hidden="true" />
              {typeKeys.map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={cn('size-2 rounded-full', typeMeta[key].dot)} />
                  {typeMeta[key].label}
                </div>
              ))}
              <span className="ml-auto">Drag or shift-click to select a range. Right-click for actions.</span>
            </div>
          </Card>

          {/* Side rail */}
          <aside className="flex flex-col gap-4">
            {/* Selected day (single) OR range summary */}
            {!isRange ? (
              <Card>
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        {rangeStart === todayKey ? 'Today' : 'Selected'}
                      </p>
                      <p className="mt-0.5 text-base font-semibold">{fmtDayLong(rangeStart)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Events</p>
                      <p className="text-sm font-semibold tabular-nums">{selectedDayEvents.length}</p>
                    </div>
                  </div>
                </div>
                <OverlayScroll className="max-h-[420px] p-2">
                  {selectedDayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
                      <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                        <CalendarDays className="text-muted-foreground size-5" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-medium">Nothing scheduled</p>
                      <p className="text-muted-foreground text-xs">Click a date or add a new event.</p>
                      <Button size="sm" variant="outline" className="mt-1">
                        <Plus className="size-4" aria-hidden="true" /> New event
                      </Button>
                    </div>
                  ) : (
                    selectedDayEvents.map((e) => (
                      <ContextMenu key={e.id}>
                        <ContextMenuTrigger asChild>
                          <button
                            type="button"
                            className="group hover:bg-accent/50 focus-visible:ring-ring/50 relative flex w-full gap-2 rounded-lg p-2 text-left transition-colors outline-none focus-visible:ring-[3px]"
                            onClick={() => openEvent(e)}
                          >
                            <div className={cn('w-0.5 shrink-0 rounded-full', typeMeta[e.type].dot)} />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm leading-tight font-medium">{e.title}</p>
                                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-xs', typeMeta[e.type].pill)}>
                                  {typeMeta[e.type].label}
                                </span>
                              </div>
                              <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                                <span className="inline-flex items-center gap-1.5 tabular-nums">
                                  <Clock className="size-3.5" aria-hidden="true" />
                                  {timeRange(e)}
                                </span>
                                {e.location ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="size-3.5" aria-hidden="true" />
                                    {e.location}
                                  </span>
                                ) : null}
                              </div>
                              {e.attendees?.length ? (
                                <div className="flex items-center -space-x-1.5 pt-0.5">
                                  {e.attendees.slice(0, 4).map((a, i) => (
                                    <Avatar key={i} className="border-background size-6 border-2">
                                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                        {initials(a)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {e.attendees.length > 4 ? (
                                    <span className="text-muted-foreground pl-2 text-xs">+{e.attendees.length - 4}</span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuLabel className="text-muted-foreground truncate text-xs">{e.title}</ContextMenuLabel>
                          <ContextMenuSeparator />
                          <ContextMenuItem onSelect={() => openEvent(e)}>
                            <Eye /> View details
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <Pencil /> Edit
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <CopyPlus /> Duplicate
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem variant="destructive">
                            <Trash2 /> Cancel event
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))
                  )}
                </OverlayScroll>
              </Card>
            ) : (
              <Card>
                <div className="border-b p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        Range · {rangeDayCount} days
                      </p>
                      <p className="mt-0.5 truncate text-base font-semibold">
                        {fmtDayShort(rangeBounds.lo)} → {fmtDayShort(rangeBounds.hi)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7" aria-label="Clear range" onClick={clearRange}>
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {typeKeys.map((type) => (
                      <div key={type} className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <span className={cn('size-2 rounded-full', typeMeta[type].dot)} />
                          {typeMeta[type].label}
                        </div>
                        <p className="text-sm font-semibold tabular-nums">{rangeTypeCounts[type]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <OverlayScroll className="max-h-[420px]">
                  {rangeEvents.length === 0 ? (
                    <p className="text-muted-foreground p-4 text-center text-xs">No events in range.</p>
                  ) : (
                    rangeEvents.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        className="hover:bg-accent/40 focus-visible:ring-ring/50 flex w-full items-start gap-2 border-b px-3 py-2 text-left transition-colors outline-none last:border-b-0 focus-visible:ring-[3px] focus-visible:ring-inset"
                        onClick={() => openEvent(e)}
                      >
                        <div className="bg-background flex w-10 shrink-0 flex-col items-center rounded-md p-1 text-center">
                          <span className="text-muted-foreground text-xs uppercase">{fmtMonthShort(e.date)}</span>
                          <span className="text-sm leading-none font-semibold tabular-nums">
                            {dateFromKey(e.date).getDate()}
                          </span>
                        </div>
                        <div className={cn('w-0.5 shrink-0 self-stretch rounded-full', typeMeta[e.type].dot)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium" title={e.title}>
                            {e.title}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                            {timeRange(e)}
                            {e.location ? <span> · {e.location}</span> : null}
                          </p>
                        </div>
                        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-xs', typeMeta[e.type].pill)}>
                          {typeMeta[e.type].label}
                        </span>
                      </button>
                    ))
                  )}
                </OverlayScroll>
              </Card>
            )}

            {/* Upcoming */}
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-base leading-tight font-semibold tracking-tight">Up next</h2>
                <CardDescription>After today</CardDescription>
              </CardHeader>
              <div className="divide-y">
                {upcoming.length === 0 ? (
                  <p className="text-muted-foreground p-4 text-center text-xs">Nothing on the horizon.</p>
                ) : (
                  upcoming.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="group hover:bg-accent/40 flex w-full items-center gap-2 p-3 text-left transition-colors"
                      onClick={() => openEvent(e)}
                    >
                      <div className="bg-background flex size-10 shrink-0 flex-col items-center justify-center rounded-md text-center">
                        <span className="text-muted-foreground text-xs uppercase">{fmtMonthShort(e.date)}</span>
                        <span className="text-sm leading-none font-semibold tabular-nums">
                          {dateFromKey(e.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('size-2 shrink-0 rounded-full', typeMeta[e.type].dot)} />
                          <p className="truncate text-sm font-medium" title={e.title}>
                            {e.title}
                          </p>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                          {timeRange(e)}
                          {e.location ? <span> · {e.location}</span> : null}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </aside>
        </div>
      </PageBody>

      {/* Event Detail Dialog */}
      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        {selectedEvent ? (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div
                  className={cn('flex size-8 items-center justify-center rounded-md', typeMeta[selectedEvent.type].iconBox)}
                >
                  {(() => {
                    const Icon = typeMeta[selectedEvent.type].icon
                    return <Icon className="size-4" aria-hidden="true" />
                  })()}
                </div>
                <div>
                  <DialogTitle className="text-base">{selectedEvent.title}</DialogTitle>
                  <DialogDescription className="text-xs">
                    {typeMeta[selectedEvent.type].label} · {selectedEvent.status}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="-mx-4 max-h-[60vh] space-y-3 overflow-y-auto px-4 py-2">
              <p className="text-muted-foreground text-sm">{selectedEvent.description}</p>
              <Separator />
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground size-4" aria-hidden="true" />
                  <span className="tabular-nums">
                    {fmtDayLong(selectedEvent.date)} · {timeRange(selectedEvent)}
                  </span>
                </div>
                {selectedEvent.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground size-4" aria-hidden="true" />
                    <span>{selectedEvent.location}</span>
                  </div>
                ) : null}
                {selectedEvent.attendees?.length ? (
                  <div className="flex items-start gap-2">
                    <Users className="text-muted-foreground mt-0.5 size-4" aria-hidden="true" />
                    <div className="flex flex-wrap items-center gap-1.5">
                      {selectedEvent.attendees.map((a) => (
                        <div key={a} className="bg-muted flex items-center gap-1.5 rounded-full py-0.5 pr-2 pl-0.5 text-xs">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-background text-muted-foreground text-xs">
                              {initials(a)}
                            </AvatarFallback>
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
    </Page>
  )
}
