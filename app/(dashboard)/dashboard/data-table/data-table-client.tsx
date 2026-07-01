'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  CreditCard,
  Download,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  customers,
  planChipTone,
  statusTone,
  type Customer,
  type CustomerPlan,
  type CustomerStatus,
} from '@/lib/customers-demo-data'

type Density = 'compact' | 'comfortable'
type DateRange = 'all' | '7d' | '30d' | '90d'
type SortKey = keyof Customer

interface ColumnDef {
  key: string
  label: string
  sortable: boolean
  defaultVisible: boolean
  alignRight?: boolean
}

const columns: ColumnDef[] = [
  { key: 'name', label: 'Customer', sortable: true, defaultVisible: true },
  { key: 'plan', label: 'Plan', sortable: true, defaultVisible: true },
  { key: 'status', label: 'Status', sortable: true, defaultVisible: true },
  { key: 'mrr', label: 'MRR', sortable: true, defaultVisible: true, alignRight: true },
  { key: 'seats', label: 'Seats', sortable: true, defaultVisible: true, alignRight: true },
  { key: 'country', label: 'Country', sortable: true, defaultVisible: false },
  { key: 'lastSeen', label: 'Last seen', sortable: true, defaultVisible: true },
  { key: 'createdAt', label: 'Created', sortable: true, defaultVisible: false },
]

const STATUSES: CustomerStatus[] = ['active', 'trial', 'invited', 'churned']
const PLANS: CustomerPlan[] = ['Free', 'Pro', 'Team', 'Enterprise']

const dateRangeLabel: Record<DateRange, string> = {
  all: 'All time',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

function toggleSetValue<T>(set: Set<T>, value: T) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function formatMoney(n: number) {
  return n === 0 ? '—' : `$${n.toLocaleString()}`
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function hueFor(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 360
}

interface TimelineEvent {
  icon: LucideIcon
  title: string
  meta: string
  tone: string
}

function timelineFor(c: Customer): TimelineEvent[] {
  const events: TimelineEvent[] = []
  events.push({ icon: UserPlus, title: 'Account created', meta: c.createdAt, tone: 'text-muted-foreground' })
  if (c.status === 'invited') {
    events.push({ icon: Mail, title: 'Invite email sent', meta: c.lastSeen, tone: 'text-amber-600 dark:text-amber-400' })
  } else if (c.status === 'trial') {
    events.push({ icon: Activity, title: 'Trial started', meta: c.lastSeen, tone: 'text-blue-600 dark:text-blue-400' })
  } else if (c.status === 'churned') {
    events.push({ icon: CreditCard, title: 'Subscription ended', meta: c.lastSeen, tone: 'text-rose-600 dark:text-rose-400' })
  } else {
    events.push({
      icon: CreditCard,
      title: `Renewed at ${formatMoney(c.mrr)}/mo`,
      meta: c.lastSeen,
      tone: 'text-emerald-600 dark:text-emerald-400',
    })
    events.push({ icon: Users, title: `${c.seats} seats provisioned`, meta: c.lastSeen, tone: 'text-muted-foreground' })
  }
  return events
}

export function DataTableClient() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<CustomerStatus>>(new Set())
  const [planFilter, setPlanFilter] = useState<Set<CustomerPlan>>(new Set())
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [sortKey, setSortKey] = useState<SortKey>('mrr')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [density, setDensity] = useState<Density>('comfortable')
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(columns.filter((c) => c.defaultVisible).map((c) => c.key)),
  )
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter, planFilter, dateRange, pageSize])

  const dateCutoff = useMemo(() => {
    if (dateRange === 'all') return null
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const d = new Date('2026-05-16')
    d.setDate(d.getDate() - days)
    return d.toISOString().slice(0, 10)
  }, [dateRange])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((c) => {
      if (statusFilter.size && !statusFilter.has(c.status)) return false
      if (planFilter.size && !planFilter.has(c.plan)) return false
      if (dateCutoff && c.lastSeen < dateCutoff) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      )
    })
  }, [search, statusFilter, planFilter, dateCutoff])

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const allOnPageChecked = paged.length > 0 && paged.every((c) => selected.has(c.id))
  const someOnPageChecked = paged.some((c) => selected.has(c.id)) && !allOnPageChecked
  const allFilteredChecked = sorted.length > 0 && sorted.every((c) => selected.has(c.id))

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (search.trim()) n++
    if (statusFilter.size) n++
    if (planFilter.size) n++
    if (dateRange !== 'all') n++
    return n
  }, [search, statusFilter, planFilter, dateRange])

  const cellPad = density === 'compact' ? 'py-1.5' : 'py-3'
  const visibleCount = columns.filter((c) => visibleCols.has(c.key)).length + 2

  function toggleSort(key: SortKey, sortable: boolean) {
    if (!sortable) return
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'mrr' || key === 'seats' ? 'desc' : 'asc')
    }
    setPage(0)
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return ArrowUpDown
    return sortDir === 'asc' ? ArrowUp : ArrowDown
  }

  function togglePage(v: boolean) {
    const next = new Set(selected)
    for (const c of paged) {
      if (v) next.add(c.id)
      else next.delete(c.id)
    }
    setSelected(next)
  }

  function selectAllFiltered() {
    setSelected(new Set(sorted.map((c) => c.id)))
  }

  function toggleRow(id: string, v: boolean) {
    const next = new Set(selected)
    if (v) next.add(id)
    else next.delete(id)
    setSelected(next)
  }

  function resetFilters() {
    setSearch('')
    setStatusFilter(new Set())
    setPlanFilter(new Set())
    setDateRange('all')
    setSortKey('mrr')
    setSortDir('desc')
  }

  function openDetail(c: Customer) {
    setDetailCustomer(c)
    setDetailOpen(true)
  }

  function exportCsv() {
    const cols = columns.filter((c) => visibleCols.has(c.key))
    const header = cols.map((c) => c.label).join(',')
    const rows = sorted.map((row) =>
      cols
        .map((c) => {
          const v = row[c.key as keyof Customer]
          const s = String(v).replace(/"/g, '""')
          return /[",\n]/.test(s) ? `"${s}"` : s
        })
        .join(','),
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">
            {customers.length} accounts · {sorted.length} after filters · {selected.size} selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={exportCsv}>
            <Download className="size-3.5" />
            Export CSV
          </Button>
          <Button size="sm" className="h-8 gap-1.5">
            <Plus className="size-3.5" />
            Add customer
          </Button>
        </div>
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 space-y-0 border-b px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs flex-1 min-w-[12rem]">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, country…"
                className="h-8 pl-7 text-sm"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Filter className="size-3.5" />
                  Status
                  {statusFilter.size > 0 ? (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                      {statusFilter.size}
                    </Badge>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs capitalize"
                    onClick={() => setStatusFilter((f) => toggleSetValue(f, s))}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={[
                          'size-2 rounded-full',
                          s === 'active'
                            ? 'bg-emerald-500'
                            : s === 'trial'
                              ? 'bg-blue-500'
                              : s === 'invited'
                                ? 'bg-amber-500'
                                : 'bg-rose-500',
                        ].join(' ')}
                      />
                      {s}
                    </span>
                    {statusFilter.has(s) ? <Check className="text-muted-foreground size-3" /> : null}
                  </button>
                ))}
                <Separator className="my-1" />
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-accent w-full rounded px-2 py-1.5 text-left text-xs"
                  onClick={() => setStatusFilter(new Set())}
                >
                  Clear
                </button>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Filter className="size-3.5" />
                  Plan
                  {planFilter.size > 0 ? (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                      {planFilter.size}
                    </Badge>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-44 p-1">
                {PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs"
                    onClick={() => setPlanFilter((f) => toggleSetValue(f, p))}
                  >
                    {p}
                    {planFilter.has(p) ? <Check className="text-muted-foreground size-3" /> : null}
                  </button>
                ))}
                <Separator className="my-1" />
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-accent w-full rounded px-2 py-1.5 text-left text-xs"
                  onClick={() => setPlanFilter(new Set())}
                >
                  Clear
                </button>
              </PopoverContent>
            </Popover>

            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger size="sm" className="h-8 w-[140px] text-xs">
                <SelectValue placeholder={dateRangeLabel[dateRange]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 ? (
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground" onClick={resetFilters}>
                <RotateCcw className="size-3" />
                Reset
              </Button>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={density}
                onValueChange={(v) => v && setDensity(v as Density)}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <ToggleGroupItem value="compact" className="h-8 px-2 text-xs">
                  Compact
                </ToggleGroupItem>
                <ToggleGroupItem value="comfortable" className="h-8 px-2 text-xs">
                  Cozy
                </ToggleGroupItem>
              </ToggleGroup>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Columns3 className="size-3.5" />
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-44 p-1">
                  {columns.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs"
                      onClick={() => setVisibleCols((v) => toggleSetValue(v, c.key))}
                    >
                      {c.label}
                      {visibleCols.has(c.key) ? <Check className="text-muted-foreground size-3" /> : null}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selected.size > 0 ? (
            <div className="bg-muted/40 -mx-4 -mb-3 flex flex-wrap items-center gap-2 border-t px-4 py-2 text-xs">
              <span className="font-medium">{selected.size} selected</span>
              {allOnPageChecked && !allFilteredChecked && sorted.length > pageSize ? (
                <button type="button" className="text-primary underline-offset-2 hover:underline" onClick={selectAllFiltered}>
                  Select all {sorted.length} matching
                </button>
              ) : null}
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Email
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Change plan
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs text-rose-600">
                  Archive
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelected(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[70vh] overflow-auto">
            <Table>
              <TableHeader className="bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]">
                <TableRow>
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={allOnPageChecked ? true : someOnPageChecked ? 'indeterminate' : false}
                      onCheckedChange={(v) => togglePage(Boolean(v))}
                    />
                  </TableHead>
                  {columns
                    .filter((c) => visibleCols.has(c.key))
                    .map((c) => {
                      const SortIcon = sortIcon(c.key as SortKey)
                      return (
                        <TableHead key={c.key} className={c.alignRight ? 'text-right' : ''}>
                          {c.sortable ? (
                            <button
                              type="button"
                              className={[
                                'hover:text-foreground inline-flex items-center gap-1 font-medium',
                                c.alignRight ? 'ml-auto' : '',
                              ].join(' ')}
                              onClick={() => toggleSort(c.key as SortKey, c.sortable)}
                            >
                              {c.label}
                              <SortIcon className="size-3" />
                            </button>
                          ) : (
                            c.label
                          )}
                        </TableHead>
                      )
                    })}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>

              {loading ? (
                <TableBody>
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell className={['pl-4', cellPad].join(' ')}>
                        <Skeleton className="size-4 rounded" />
                      </TableCell>
                      {columns
                        .filter((c) => visibleCols.has(c.key))
                        .map((c) => (
                          <TableCell key={c.key} className={cellPad}>
                            <Skeleton className={['h-3', c.key === 'name' ? 'w-40' : 'w-16'].join(' ')} />
                          </TableCell>
                        ))}
                      <TableCell className={cellPad}>
                        <Skeleton className="size-4 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  {paged.map((c) => (
                    <TableRow
                      key={c.id}
                      data-state={selected.has(c.id) ? 'selected' : undefined}
                      className="hover:bg-muted/40 cursor-pointer"
                      onClick={() => openDetail(c)}
                    >
                      <TableCell className={['pl-4', cellPad].join(' ')} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(c.id)}
                          onCheckedChange={(v) => toggleRow(c.id, Boolean(v))}
                        />
                      </TableCell>
                      {visibleCols.has('name') ? (
                        <TableCell className={cellPad}>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-muted-foreground text-xs">{c.email}</div>
                        </TableCell>
                      ) : null}
                      {visibleCols.has('plan') ? (
                        <TableCell className={['text-muted-foreground', cellPad].join(' ')}>{c.plan}</TableCell>
                      ) : null}
                      {visibleCols.has('status') ? (
                        <TableCell className={cellPad}>
                          <Badge
                            variant="outline"
                            className={[
                              'gap-1 px-2 text-[10px] font-medium uppercase tracking-wide',
                              statusTone[c.status],
                            ].join(' ')}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                      ) : null}
                      {visibleCols.has('mrr') ? (
                        <TableCell className={['text-right tabular-nums', cellPad].join(' ')}>
                          {formatMoney(c.mrr)}
                        </TableCell>
                      ) : null}
                      {visibleCols.has('seats') ? (
                        <TableCell className={['text-right tabular-nums text-muted-foreground', cellPad].join(' ')}>
                          {c.seats || '—'}
                        </TableCell>
                      ) : null}
                      {visibleCols.has('country') ? (
                        <TableCell className={['text-muted-foreground', cellPad].join(' ')}>{c.country}</TableCell>
                      ) : null}
                      {visibleCols.has('lastSeen') ? (
                        <TableCell className={['text-muted-foreground text-xs tabular-nums', cellPad].join(' ')}>
                          {c.lastSeen}
                        </TableCell>
                      ) : null}
                      {visibleCols.has('createdAt') ? (
                        <TableCell className={['text-muted-foreground text-xs tabular-nums', cellPad].join(' ')}>
                          {c.createdAt}
                        </TableCell>
                      ) : null}
                      <TableCell className={cellPad} onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetail(c)}>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Email</DropdownMenuItem>
                            <DropdownMenuItem>Copy ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-600">Archive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paged.length === 0 ? (
                    <TableEmpty colSpan={visibleCount}>
                      <div className="flex flex-col items-center gap-2 py-6">
                        <SlidersHorizontal className="text-muted-foreground size-5" />
                        <p className="text-sm">No customers match your filters.</p>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                          Reset filters
                        </Button>
                      </div>
                    </TableEmpty>
                  ) : null}
                </TableBody>
              )}
            </Table>
          </div>
        </CardContent>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Showing{' '}
            <span className="text-foreground tabular-nums">
              {paged.length === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)}
            </span>{' '}
            of <span className="text-foreground tabular-nums">{sorted.length}</span>
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger size="sm" className="h-7 w-[68px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-muted-foreground tabular-nums">
              Page {page + 1} of {pageCount}
            </span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-7" disabled={page === 0} onClick={() => setPage(0)}>
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="size-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={page >= pageCount - 1}
                onClick={() => setPage(pageCount - 1)}
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="gap-0 p-0 sm:max-w-md">
          {detailCustomer ? (
            <>
              <SheetHeader className="space-y-0 border-b p-5">
                <div className="flex items-start gap-3">
                  <Avatar size="lg" rounded="lg" className="ring-background ring-2 shadow-sm">
                    <AvatarFallback
                      className="text-sm font-semibold"
                      style={{
                        background: `hsl(${hueFor(detailCustomer.name)} 70% 92%)`,
                        color: `hsl(${hueFor(detailCustomer.name)} 50% 28%)`,
                      }}
                    >
                      {initials(detailCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <SheetTitle className="truncate text-base leading-tight">{detailCustomer.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-1 text-xs">
                      <Mail className="size-3" />
                      {detailCustomer.email}
                    </SheetDescription>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Badge
                        variant="outline"
                        className={[
                          'gap-1 px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide',
                          statusTone[detailCustomer.status],
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'size-1.5 rounded-full',
                            detailCustomer.status === 'active'
                              ? 'bg-emerald-500'
                              : detailCustomer.status === 'trial'
                                ? 'bg-blue-500'
                                : detailCustomer.status === 'invited'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500',
                          ].join(' ')}
                        />
                        {detailCustomer.status}
                      </Badge>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[10px] font-medium',
                          planChipTone[detailCustomer.plan],
                        ].join(' ')}
                      >
                        {detailCustomer.plan}
                      </span>
                      <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                        <MapPin className="size-3" />
                        {detailCustomer.country}
                      </span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 gap-px border-b bg-border">
                  <div className="bg-background flex flex-col gap-1 px-4 py-3">
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
                      <CreditCard className="size-3" />
                      MRR
                    </span>
                    <span className="text-base font-semibold tabular-nums">{formatMoney(detailCustomer.mrr)}</span>
                    {detailCustomer.mrr > 0 ? (
                      <span className="text-emerald-600 inline-flex items-center gap-0.5 text-[10px] font-medium dark:text-emerald-400">
                        <ArrowUpRight className="size-2.5" />
                        {Math.round((detailCustomer.mrr * 12) / 1000)}k ARR
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">No revenue</span>
                    )}
                  </div>
                  <div className="bg-background flex flex-col gap-1 px-4 py-3">
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
                      <Users className="size-3" />
                      Seats
                    </span>
                    <span className="text-base font-semibold tabular-nums">{detailCustomer.seats || 0}</span>
                    {detailCustomer.seats ? (
                      <span className="text-muted-foreground tabular-nums text-[10px]">
                        ${Math.round(detailCustomer.mrr / detailCustomer.seats)}/seat
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">No seats</span>
                    )}
                  </div>
                  <div className="bg-background flex flex-col gap-1 px-4 py-3">
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
                      <Building2 className="size-3" />
                      Tier
                    </span>
                    <span className="text-base font-semibold">{detailCustomer.plan}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {detailCustomer.status === 'active'
                        ? 'Renews monthly'
                        : detailCustomer.status === 'trial'
                          ? 'Trial period'
                          : detailCustomer.status === 'invited'
                            ? 'Awaiting accept'
                            : 'Cancelled'}
                    </span>
                  </div>
                </div>

                <dl className="divide-border divide-y px-5 text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-muted-foreground text-xs">Customer ID</dt>
                    <dd className="font-mono text-xs">cus_{detailCustomer.id.padStart(6, '0')}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-muted-foreground text-xs">Customer since</dt>
                    <dd className="tabular-nums text-xs">{detailCustomer.createdAt}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-muted-foreground text-xs">Last seen</dt>
                    <dd className="tabular-nums text-xs">{detailCustomer.lastSeen}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-muted-foreground text-xs">Country</dt>
                    <dd className="text-xs">{detailCustomer.country}</dd>
                  </div>
                </dl>

                <div className="border-t px-5 py-4">
                  <div className="text-muted-foreground mb-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
                    <Activity className="size-3" />
                    Recent activity
                  </div>
                  <ol className="relative space-y-3 pl-5">
                    <span className="bg-border absolute top-1 bottom-1 left-[7px] w-px" />
                    {timelineFor(detailCustomer).map((ev, i) => {
                      const EvIcon = ev.icon
                      return (
                        <li key={i} className="relative">
                          <span className="bg-background border-border absolute -left-5 top-0.5 inline-flex size-4 items-center justify-center rounded-full border">
                            <EvIcon className={['size-2.5', ev.tone].join(' ')} />
                          </span>
                          <div className="text-xs font-medium leading-tight">{ev.title}</div>
                          <div className="text-muted-foreground tabular-nums text-[10px]">{ev.meta}</div>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </div>

              <div className="bg-background sticky bottom-0 flex items-center gap-2 border-t p-4">
                <Button size="sm" className="h-8 flex-1 text-xs">
                  Open profile
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Mail className="size-3.5" />
                  Email
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-8">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Change plan</DropdownMenuItem>
                    <DropdownMenuItem>Copy ID</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-600">Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}