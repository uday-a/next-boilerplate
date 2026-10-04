'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertCircle, CalendarIcon, CheckCircle2, CloudOff, Loader2, Pencil, RotateCcw, Search, Trash2, UserPlus, UserX } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { cn } from '@/lib/utils'

interface Member {
  id: number
  name: string | null
  email: string
  role: string
  avatarUrl: string | null
  createdAt: string
}

interface PendingInvite {
  id: number
  email: string
  role: string
  invitedBy: number | null
  expiresAt: string
  createdAt: string
}

const ROLES = ['admin', 'editor', 'user'] as const
type RoleFilter = 'all' | (typeof ROLES)[number]

// Catch obvious typos before the round-trip; the server still validates.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initials = (n: string) =>
  n
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function displayName(m: Member) {
  return m.name || m.email.split('@')[0] || m.email
}

function errorMessage(json: unknown, fallback: string) {
  return (json as { error?: { message?: string } } | null)?.error?.message ?? fallback
}

export function TeamSettingsClient({ role }: { role?: string }) {
  const t = useTranslations()
  const locale = useLocale()
  const canInvite = role === 'admin' || role === 'editor'

  // Local copy so the demo row actions (edit / remove / undo) have somewhere
  // to write. Wire to PATCH / DELETE /api/team/members/:id with a real DB.
  const [members, setMembers] = useState<Member[]>([])
  const [membersPending, setMembersPending] = useState(true)
  const [membersFailed, setMembersFailed] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [invitesPending, setInvitesPending] = useState(true)
  // A 403 on the invites endpoint just means the viewer isn't admin/editor —
  // not a failure. Show the viewer note instead of an error banner.
  const [invitesForbidden, setInvitesForbidden] = useState(false)
  const [invitesFailed, setInvitesFailed] = useState(false)

  const loadMembers = useCallback(async () => {
    setMembersPending(true)
    setMembersFailed(false)
    try {
      const res = await fetch('/api/team/members', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ members: Member[] }>
      if (json.ok) setMembers(json.data.members.map((m) => ({ ...m })))
      else setMembersFailed(true)
    } catch {
      setMembersFailed(true)
    } finally {
      setMembersPending(false)
    }
  }, [])

  const loadInvites = useCallback(async () => {
    setInvitesPending(true)
    setInvitesFailed(false)
    try {
      const res = await fetch('/api/team/invites', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ invites: PendingInvite[] }>
      if (json.ok) {
        setPendingInvites(json.data.invites)
        setInvitesForbidden(false)
      } else if (res.status === 403 || json.error.code === 'FORBIDDEN') {
        setInvitesForbidden(true)
      } else {
        setInvitesFailed(true)
      }
    } catch {
      setInvitesFailed(true)
    } finally {
      setInvitesPending(false)
    }
  }, [])

  useEffect(() => {
    void loadMembers()
    void loadInvites()
  }, [loadMembers, loadInvites])

  const headerDescription = membersFailed
    ? 'Members, roles, and pending invitations.'
    : invitesForbidden || invitesFailed
      ? `${members.length} members`
      : t('settings.team.subtitle', { members: members.length, pending: pendingInvites.length })

  // ── Filters ────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('')
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

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = joinedRange?.from ? joinedRange.from.getTime() : null
    // Inclusive end: the whole of the last selected day.
    const to = joinedRange?.to ? joinedRange.to.getTime() + 86_400_000 - 1 : null
    return members.filter((m) => {
      if (roleFilter !== 'all' && m.role !== roleFilter) return false
      if (q && !`${m.name ?? ''} ${m.email}`.toLowerCase().includes(q)) return false
      const joined = new Date(m.createdAt).getTime()
      if (from !== null && joined < from) return false
      if (to !== null && joined > to) return false
      return true
    })
  }, [members, query, roleFilter, joinedRange])

  const activeFilters = (query.trim() ? 1 : 0) + (roleFilter !== 'all' ? 1 : 0) + (joinedRange?.from ? 1 : 0)

  function resetFilters() {
    setQuery('')
    setRoleFilter('all')
    setJoinedRange(undefined)
  }

  // ── Row actions ────────────────────────────────────────────────────────
  const [editing, setEditing] = useState<Member | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' })
  const [editError, setEditError] = useState('')

  function openEdit(m: Member) {
    setEditing(m)
    setEditForm({ name: m.name ?? '', email: m.email, role: m.role })
    setEditError('')
  }

  function saveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    if (!editForm.name.trim() || !/^\S+@\S+\.\S+$/.test(editForm.email.trim())) {
      setEditError(t('settings.team.editInvalid'))
      return
    }
    const updated = { ...editing, name: editForm.name.trim(), email: editForm.email.trim(), role: editForm.role }
    setMembers((list) => list.map((m) => (m.id === updated.id ? updated : m)))
    setEditing(null)
    toast.success(t('admin.toast.updated', { name: displayName(updated) }))
  }

  const [removing, setRemoving] = useState<Member | null>(null)

  function confirmRemove() {
    const m = removing
    if (!m) return
    const index = members.findIndex((x) => x.id === m.id)
    setMembers((list) => list.filter((x) => x.id !== m.id))
    setRemoving(null)
    toast.success(t('settings.team.removed', { name: displayName(m) }), {
      action: {
        label: t('admin.toast.undo'),
        onClick: () => {
          setMembers((list) => {
            const next = [...list]
            next.splice(Math.min(index, next.length), 0, m)
            return next
          })
          toast(t('admin.toast.restored', { name: displayName(m) }))
        },
      },
    })
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ── Invites ────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ email: '', role: 'user' })
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<number | null>(null)
  const [resendingEmail, setResendingEmail] = useState<string | null>(null)
  const [revokeError, setRevokeError] = useState<string | null>(null)

  async function postInvite(email: string, inviteRole: string) {
    try {
      const res = await fetch('/api/team/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: inviteRole }),
      })
      const json = (await res.json()) as ApiResponse<{ invite: PendingInvite }>
      return json.ok ? json : { ok: false as const, message: errorMessage(json, t('settings.team.inviteFailed')) }
    } catch {
      return { ok: false as const, message: t('settings.team.inviteFailed') }
    }
  }

  async function sendInvite() {
    if (!EMAIL_RE.test(form.email.trim())) {
      setSubmitError(t('settings.team.invalidEmail'))
      setSubmitState('error')
      return
    }
    setSubmitState('submitting')
    setSubmitError(null)
    const res = await postInvite(form.email, form.role)
    if (!res.ok) {
      setSubmitError(res.message)
      setSubmitState('error')
      return
    }
    setForm({ email: '', role: 'user' })
    setSubmitState('idle')
    setDialogOpen(false)
    setNotice(t('settings.team.inviteSent', { email: res.data.invite.email }))
    await loadInvites()
  }

  async function revokeInvite(id: number) {
    setRevokingId(id)
    setNotice(null)
    let message: string | null = null
    try {
      const res = await fetch(`/api/team/invites/${id}`, { method: 'DELETE' })
      const json = (await res.json()) as ApiResponse<{ revoked: number }>
      if (!json.ok) message = errorMessage(json, t('settings.team.revokeFailed'))
    } catch {
      message = t('settings.team.revokeFailed')
    }
    setRevokingId(null)
    // Surface revoke failures inline via the pending card error slot.
    setRevokeError(message)
    if (!message) await loadInvites()
  }

  // Resend = revoke the stale row, then issue a fresh token via POST, so a
  // given email never stacks duplicate pending rows.
  async function resendInvite(invite: PendingInvite) {
    setResendingEmail(invite.email)
    setNotice(null)
    setRevokeError(null)
    await fetch(`/api/team/invites/${invite.id}`, { method: 'DELETE' }).catch(() => null)
    const res = await postInvite(invite.email, invite.role)
    setResendingEmail(null)
    if (!res.ok) {
      setRevokeError(res.message)
      await loadInvites()
      return
    }
    setNotice(t('settings.team.inviteSent', { email: invite.email }))
    await loadInvites()
  }

  const roleOptions = ROLES.map((r) => (
    <SelectItem key={r} value={r}>
      {t(`admin.roleNames.${r}`)}
    </SelectItem>
  ))

  return (
    <Page>
      <PageHeader
        actions={
          canInvite && !invitesForbidden ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="size-4" aria-hidden="true" /> {t('settings.team.invite')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings.team.dialogTitle')}</DialogTitle>
                  <DialogDescription>{t('settings.team.dialogDescription')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-1">
                  <div className="grid gap-2">
                    <Label htmlFor="invite-email">{t('settings.team.emailLabel')}</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder={t('settings.team.emailPlaceholder')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invite-role">{t('settings.team.roleLabel')}</Label>
                    <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...ROLES].reverse().map((r) => (
                          <SelectItem key={r} value={r}>
                            {t(`admin.roleNames.${r}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {submitError ? (
                    <div className="text-destructive flex items-center gap-2 text-sm">
                      <AlertCircle className="size-4" aria-hidden="true" />
                      {submitError}
                    </div>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button variant="outline" disabled={submitState === 'submitting'} onClick={() => setDialogOpen(false)}>
                    {t('settings.team.cancel')}
                  </Button>
                  <Button disabled={submitState === 'submitting' || !form.email} onClick={() => void sendInvite()}>
                    {submitState === 'submitting' ? <Loader2 className="size-4 animate-spin" /> : null}
                    {submitState === 'submitting' ? t('settings.team.sending') : t('settings.team.send')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      >
        <PageHeaderHeading title={t('nav.items.team')} description={headerDescription} />
      </PageHeader>

      <PageBody className="space-y-4">
        {notice ? (
          <div
            className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            role="status"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {notice}
          </div>
        ) : null}

        {membersFailed ? (
          <Card>
            <EmptyState
              icon={CloudOff}
              title="Couldn't load the team"
              description={t('settings.team.loadFailed')}
              role="alert"
            >
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void loadMembers()}>
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size="small"
                  prefixIcon={<Search className="size-4" aria-hidden="true" />}
                  allowClear
                  placeholder={t('settings.team.search')}
                  aria-label={t('settings.team.search')}
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
                <SelectTrigger size="sm" className="sm:w-36" aria-label={t('admin.filters.role')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.filters.allRoles')}</SelectItem>
                  {roleOptions}
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
                {t('admin.filters.showing', { shown: filteredMembers.length, total: members.length })}
              </span>
            </div>

            <TooltipProvider delayDuration={300}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('settings.team.member')}</TableHead>
                    <TableHead>{t('settings.team.role')}</TableHead>
                    <TableHead>{t('settings.team.status')}</TableHead>
                    <TableHead>{t('settings.team.joined')}</TableHead>
                    <TableHead className="w-24 text-right">
                      <span className="sr-only">{t('admin.actions')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersPending ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-sm">
                        {t('settings.team.loading')}
                      </TableCell>
                    </TableRow>
                  ) : !filteredMembers.length ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={UserX}
                          title={members.length ? t('admin.noMatchTitle') : t('settings.team.emptyMembers')}
                          description={members.length ? t('admin.noMatchDescription') : undefined}
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
                    filteredMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                                {initials(displayName(m))}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{displayName(m)}</div>
                              <div className="text-muted-foreground text-xs">{m.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{t(`admin.roleNames.${m.role}`)}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className="bg-success size-1.5 rounded-full" aria-hidden="true" />
                            {t('settings.team.active')}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs tabular-nums">{formatDate(m.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-foreground size-8"
                                  aria-label={t('admin.editFor', { name: displayName(m) })}
                                  onClick={() => openEdit(m)}
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
                                  aria-label={t('settings.team.removeFor', { name: displayName(m) })}
                                  onClick={() => setRemoving(m)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('settings.team.remove')}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </Card>
        )}

        {canInvite && !invitesForbidden ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('settings.team.pendingTitle')}</CardTitle>
              <CardDescription>{t('settings.team.pendingDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {invitesFailed ? (
                <div className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0">
                  <span className="text-muted-foreground text-sm">Couldn&apos;t load pending invites.</span>
                  <Button variant="outline" size="sm" onClick={() => void loadInvites()}>
                    {t('settings.activity.states.retry')}
                  </Button>
                </div>
              ) : invitesPending ? (
                <div className="text-muted-foreground py-3 text-sm first:pt-0">{t('settings.team.loading')}</div>
              ) : !pendingInvites.length ? (
                <div className="text-muted-foreground py-3 text-sm first:pt-0">{t('settings.team.emptyPending')}</div>
              ) : (
                pendingInvites.map((p) => (
                  // flex-wrap: at 375px the Resend/Revoke pair drops below the
                  // email instead of overflowing the card.
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">{p.email}</p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {t('settings.team.invitedAs', { role: t(`admin.roleNames.${p.role}`) })} ·{' '}
                        {t('settings.team.expires', { date: formatDate(p.expiresAt) })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resendingEmail === p.email || revokingId === p.id}
                        onClick={() => void resendInvite(p)}
                      >
                        {resendingEmail === p.email ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                        {t('settings.team.resend')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        disabled={revokingId === p.id || resendingEmail === p.email}
                        onClick={() => void revokeInvite(p.id)}
                      >
                        {revokingId === p.id ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                        {t('settings.team.revoke')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {revokeError ? (
                <div className="text-destructive flex items-center gap-2 pt-3 text-sm" role="alert">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  {revokeError}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground text-xs">{t('settings.team.viewerNote')}</p>
        )}
      </PageBody>

      {/* Edit member */}
      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.team.editTitle')}</DialogTitle>
            <DialogDescription>{t('settings.team.editDescription')}</DialogDescription>
          </DialogHeader>
          <form id="edit-member-form" noValidate onSubmit={saveEdit}>
            <div className="grid gap-4 py-1">
              <div className="grid gap-2">
                <Label htmlFor="edit-member-name">{t('admin.edit.name')}</Label>
                <Input
                  id="edit-member-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-member-email">{t('settings.team.emailLabel')}</Label>
                <Input
                  id="edit-member-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-member-role">{t('settings.team.role')}</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                  <SelectTrigger id="edit-member-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>{roleOptions}</SelectContent>
                </Select>
              </div>
              {editError ? (
                <p className="text-destructive text-sm" role="alert">
                  {editError}
                </p>
              ) : null}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t('admin.edit.cancel')}
            </Button>
            <Button type="submit" form="edit-member-form">
              {t('admin.edit.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={!!removing} onOpenChange={(v) => { if (!v) setRemoving(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.team.removeTitle', { name: removing ? displayName(removing) : '' })}</DialogTitle>
            <DialogDescription>{t('settings.team.removeDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              {t('admin.edit.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              <Trash2 className="size-4" aria-hidden="true" />
              {t('settings.team.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
