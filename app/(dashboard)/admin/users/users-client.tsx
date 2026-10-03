'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowUpDown, CalendarIcon, CloudOff, Pencil, RotateCcw, Search, ShieldAlert, Trash2, UserX } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ApiResponse } from '@/lib/api/response'
import type { SessionUser } from '@/lib/auth/types'
import { cn } from '@/lib/utils'

interface AdminUser {
  id: number
  login: string
  name: string | null
  role: string
  createdAt: string
}

const ROLES = ['admin', 'editor', 'user'] as const
type RoleFilter = 'all' | (typeof ROLES)[number]
type AdminSortKey = 'name' | 'role' | 'joined'

const SORT_BUTTON =
  'hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm font-medium focus-visible:ring-2 focus-visible:outline-none'

const initials = (n: string) =>
  n
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function UsersClient() {
  const t = useTranslations()
  const locale = useLocale()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [pending, setPending] = useState(true)
  const [failed, setFailed] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  // WHY: the 403 names the current role vs the required admin role
  // and gives a next step, instead of a bare "no permission".
  const [sessionRole, setSessionRole] = useState<string | null>(null)
  const currentRole = sessionRole ?? t('admin.roleNames.user')

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: SessionUser }>>)
      .then((res) => {
        if (res.ok) setSessionRole(res.data.user.role)
      })
      .catch(() => undefined)
  }, [])

  // Local copy so the demo actions (edit / delete / undo) have somewhere to
  // write. Wire these to PATCH / DELETE /api/admin/users/:id when a DB exists.
  const load = useCallback(async () => {
    setPending(true)
    setFailed(false)
    setForbidden(false)
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<AdminUser[]>
      if (res.status === 403 || (!json.ok && json.error.code === 'FORBIDDEN')) setForbidden(true)
      else if (json.ok) setUsers(Array.isArray(json.data) ? json.data.map((u) => ({ ...u })) : [])
      // Boolean only: raw fetch errors never reach the UI.
      else setFailed(true)
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const description = forbidden || failed ? t('admin.everyone') : t('admin.subtitle', { count: users.length })

  // ── Filters ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [joinedRange, setJoinedRange] = useState<DateRange | undefined>(undefined)
  const [rangeOpen, setRangeOpen] = useState(false)

  function handleRangeSelect(range: DateRange | undefined) {
    setJoinedRange(range)
    if (range?.from && range?.to) setRangeOpen(false)
  }

  const rangeLabel = useMemo(() => {
    if (!joinedRange?.from || !joinedRange?.to) return t('admin.filters.joined')
    const df = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    return `${df.format(joinedRange.from)} – ${df.format(joinedRange.to)}`
  }, [joinedRange, locale, t])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const from = joinedRange?.from ? joinedRange.from.getTime() : null
    // Inclusive end: the whole of the last selected day.
    const to = joinedRange?.to ? joinedRange.to.getTime() + 86_400_000 - 1 : null
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (q && !`${u.name ?? ''} ${u.login}`.toLowerCase().includes(q)) return false
      const joined = new Date(u.createdAt).getTime()
      if (from !== null && joined < from) return false
      if (to !== null && joined > to) return false
      return true
    })
  }, [users, search, roleFilter, joinedRange])

  const activeFilters = (search.trim() ? 1 : 0) + (roleFilter !== 'all' ? 1 : 0) + (joinedRange?.from ? 1 : 0)

  function resetFilters() {
    setSearch('')
    setRoleFilter('all')
    setJoinedRange(undefined)
  }

  // WHY: client sorting on User / Role / Joined. Default Joined desc
  // (newest first) matches how admins scan this list.
  const [sortKey, setSortKey] = useState<AdminSortKey>('joined')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function toggleSort(key: AdminSortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'joined' ? 'desc' : 'asc')
    }
  }

  function ariaSort(key: AdminSortKey): 'ascending' | 'descending' | 'none' {
    if (sortKey !== key) return 'none'
    return sortDir === 'asc' ? 'ascending' : 'descending'
  }

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      if (sortKey === 'joined') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
      if (sortKey === 'role') return a.role.localeCompare(b.role) * dir
      return (a.name ?? a.login).localeCompare(b.name ?? b.login) * dir
    })
  }, [filtered, sortKey, sortDir])

  // ── Row actions ────────────────────────────────────────────────────────
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ name: '', login: '', role: 'user' })
  const [formError, setFormError] = useState('')

  function openEdit(u: AdminUser) {
    setEditing(u)
    setForm({ name: u.name ?? '', login: u.login, role: u.role })
    setFormError('')
  }

  function saveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    if (!form.name.trim() || !form.login.trim()) {
      setFormError(t('admin.edit.required'))
      return
    }
    const updated = { ...editing, name: form.name.trim(), login: form.login.trim(), role: form.role }
    setUsers((list) => list.map((x) => (x.id === updated.id ? updated : x)))
    setEditing(null)
    toast.success(t('admin.toast.updated', { name: updated.name }))
  }

  const [deleting, setDeleting] = useState<AdminUser | null>(null)

  function confirmDelete() {
    const u = deleting
    if (!u) return
    const index = users.findIndex((x) => x.id === u.id)
    setUsers((list) => list.filter((x) => x.id !== u.id))
    setDeleting(null)
    const name = u.name || u.login
    toast.success(t('admin.toast.deleted', { name }), {
      action: {
        label: t('admin.toast.undo'),
        onClick: () => {
          setUsers((list) => {
            const next = [...list]
            next.splice(Math.min(index, next.length), 0, u)
            return next
          })
          toast(t('admin.toast.restored', { name }))
        },
      },
    })
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function sortHead(key: AdminSortKey, label: string) {
    return (
      <TableHead scope="col" aria-sort={ariaSort(key)}>
        <button type="button" className={SORT_BUTTON} onClick={() => toggleSort(key)}>
          {label}
          <ArrowUpDown
            className={cn('size-3', sortKey === key ? 'text-foreground' : 'text-muted-foreground')}
            aria-hidden="true"
          />
        </button>
      </TableHead>
    )
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading title={t('nav.items.users')} description={description} />
      </PageHeader>

      <PageBody>
        {forbidden ? (
          <Card>
            <EmptyState
              role="alert"
              icon={ShieldAlert}
              title={t('admin.adminsOnly')}
              description={`${t('admin.forbidden')} ${t('admin.forbiddenRole', { role: currentRole })} ${t('admin.forbiddenHelp')}`}
            />
          </Card>
        ) : failed ? (
          <Card>
            <EmptyState role="alert" icon={CloudOff} title={t('admin.loadFailedTitle')} description={t('admin.loadFailed')}>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void load()}>
                {t('settings.activity.states.retry')}
              </Button>
            </EmptyState>
          </Card>
        ) : (
          <Card>
            {/* Filters */}
            <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-64">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  prefixIcon={<Search className="size-4" aria-hidden="true" />}
                  allowClear
                  placeholder={t('admin.filters.search')}
                  aria-label={t('admin.filters.search')}
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
                <SelectTrigger size="sm" className="sm:w-36" aria-label={t('admin.filters.role')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.filters.allRoles')}</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`admin.roleNames.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn('justify-start gap-2 font-normal', !joinedRange?.from && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="size-4" aria-hidden="true" />
                    {rangeLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <RangeCalendar selected={joinedRange} onSelect={handleRangeSelect} />
                </PopoverContent>
              </Popover>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={resetFilters}>
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  {t('admin.filters.reset')}
                </Button>
              )}
              <span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums sm:ml-auto">
                {t('admin.filters.showing', { shown: filtered.length, total: users.length })}
              </span>
            </div>

            <TooltipProvider delayDuration={300}>
              <Table>
                {/* WHY: sticky header matches the data table. */}
                <TableHeader className="bg-background sticky top-0 z-10">
                  <TableRow>
                    {sortHead('name', t('admin.user'))}
                    {sortHead('role', t('admin.role'))}
                    {sortHead('joined', t('admin.joined'))}
                    <TableHead className="w-24 text-right">
                      <span className="sr-only">{t('admin.actions')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground text-sm">
                        {t('admin.loading')}
                      </TableCell>
                    </TableRow>
                  ) : !filtered.length ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState
                          icon={UserX}
                          title={users.length ? t('admin.noMatchTitle') : t('admin.empty')}
                          description={users.length ? t('admin.noMatchDescription') : undefined}
                        >
                          {activeFilters > 0 && (
                            <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                              {t('admin.filters.reset')}
                            </Button>
                          )}
                        </EmptyState>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((u) => {
                      const name = u.name || u.login
                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                                  {initials(name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{name}</div>
                                <div className="text-muted-foreground text-xs">@{u.login}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{t(`admin.roleNames.${u.role}`)}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs tabular-nums">{formatDate(u.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground size-8"
                                    aria-label={t('admin.editFor', { name })}
                                    onClick={() => openEdit(u)}
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('admin.menu.edit')}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8"
                                    aria-label={t('admin.deleteFor', { name })}
                                    onClick={() => setDeleting(u)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('admin.menu.delete')}</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </Card>
        )}
      </PageBody>

      {/* Edit user */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.edit.title')}</DialogTitle>
            <DialogDescription>{t('admin.edit.description')}</DialogDescription>
          </DialogHeader>
          <form id="edit-user-form" onSubmit={saveEdit}>
            <div className="grid gap-4 py-1">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t('admin.edit.name')}</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-login">{t('admin.edit.username')}</Label>
                <Input
                  id="edit-login"
                  value={form.login}
                  onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">{t('admin.role')}</Label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`admin.roleNames.${r}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              )}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t('admin.edit.cancel')}
            </Button>
            <Button type="submit" form="edit-user-form">
              {t('admin.edit.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.delete.title', { name: deleting?.name || deleting?.login || '' })}</DialogTitle>
            <DialogDescription>{t('admin.delete.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t('admin.edit.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="size-4" aria-hidden="true" />
              {t('admin.delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
