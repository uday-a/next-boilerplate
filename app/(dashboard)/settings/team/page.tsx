'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2, Mail, MoreHorizontal, Search, UserPlus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
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
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ApiResponse } from '@/lib/api/response'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

interface Member {
  id: number
  name: string | null
  email: string
  role: string
  avatarUrl: string | null
  createdAt: string
}

interface Invite {
  id: number
  email: string
  role: string
  invitedBy: number | null
  expiresAt: string
  createdAt: string
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export default function TeamSettingsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [pending, setPending] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('user')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [revokingId, setRevokingId] = useState<number | null>(null)
  const [resendingId, setResendingId] = useState<number | null>(null)

  // Canonical display names (Nuxt `admin.roleNames`): the `user` role reads
  // as Member everywhere — pills and invite lines alike.
  function roleLabel(role: string) {
    return t(`admin.roleNames.${role}`)
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const load = useCallback(async () => {
    setPending(true)
    setLoadError(null)
    try {
      const [mRes, iRes] = await Promise.all([
        fetch('/api/team/members', { cache: 'no-store' }),
        fetch('/api/team/invites', { cache: 'no-store' }),
      ])
      const mJson = (await mRes.json()) as ApiResponse<{ members: Member[] }>
      const iJson = (await iRes.json()) as ApiResponse<{ invites: Invite[] }>
      if (mJson.ok) setMembers(mJson.data.members)
      else setLoadError(t('settings.team.loadFailed'))
      if (iJson.ok) setInvites(iJson.data.invites)
      // invites may 403 for viewers — members list still renders
    } catch {
      setLoadError(t('settings.team.loadFailed'))
    } finally {
      setPending(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => `${m.name ?? ''} ${m.email}`.toLowerCase().includes(q))
  }, [members, search])

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(inviteEmail)) {
      setInviteError(t('settings.team.invalidEmail'))
      return
    }
    setInviting(true)
    setInviteError(null)
    try {
      const res = await fetch('/api/team/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase(), role: inviteRole }),
      })
      const json = (await res.json()) as ApiResponse<unknown>
      if (!json.ok) {
        setInviteError(t('settings.team.inviteFailed'))
        return
      }
      setInviteOpen(false)
      setInviteEmail('')
      await load()
    } catch {
      setInviteError(t('settings.team.inviteFailed'))
    } finally {
      setInviting(false)
    }
  }

  async function revokeInvite(id: number) {
    setRevokingId(id)
    try {
      const res = await fetch(`/api/team/invites/${id}`, { method: 'DELETE' })
      const json = (await res.json()) as ApiResponse<unknown>
      if (json.ok) await load()
    } finally {
      setRevokingId(null)
    }
  }

  // Resend = revoke + re-invite (issues a fresh token + expiry + email).
  async function resendInvite(invite: Invite) {
    setResendingId(invite.id)
    try {
      await fetch(`/api/team/invites/${invite.id}`, { method: 'DELETE' })
      const res = await fetch('/api/team/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invite.email, role: invite.role }),
      })
      const json = (await res.json()) as ApiResponse<unknown>
      if (json.ok) await load()
    } finally {
      setResendingId(null)
    }
  }

  return (
    <Page>
      <PageHeader
        actions={
          <Button className="gap-2" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" /> {t('settings.team.invite')}
          </Button>
        }
      >
        <PageHeaderHeading
          title={t('settings.team.title')}
          description={t('settings.team.subtitle', { members: members.length, pending: invites.length })}
        />
      </PageHeader>
      <PageBody className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('settings.team.search')}
              className="h-9 pl-8"
            />
          </div>
        </div>

        {pending ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> {t('settings.team.loading')}
          </div>
        ) : loadError ? (
          <div className="text-destructive flex items-center gap-2 text-sm" role="alert">
            <AlertCircle className="size-4" /> {loadError}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('settings.team.member')}</TableHead>
                  <TableHead>{t('settings.team.role')}</TableHead>
                  <TableHead>{t('settings.team.status')}</TableHead>
                  <TableHead>{t('settings.team.joined')}</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs font-semibold">
                            {initials(member.name ?? member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name ?? member.email}</p>
                          <p className="text-muted-foreground text-xs">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {roleLabel(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="bg-success size-1.5 rounded-full" />
                        {t('settings.team.active')}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs tabular-nums">{formatDate(member.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Change role…</DropdownMenuItem>
                          <DropdownMenuItem>View activity</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">{t('settings.team.remove')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4" /> {t('settings.team.pendingTitle')}
            </CardTitle>
            <CardDescription>{t('settings.team.pendingDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {!invites.length ? (
              <p className="text-muted-foreground py-2 text-sm">{t('settings.team.emptyPending')}</p>
            ) : (
              invites.map((invite) => (
                <div key={invite.email} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-muted-foreground text-xs">
                      {t('settings.team.invitedAs', { role: roleLabel(invite.role) })} ·{' '}
                      {t('settings.team.expires', { date: formatDate(invite.expiresAt) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={resendingId === invite.id}
                      onClick={() => void resendInvite(invite)}
                    >
                      {resendingId === invite.id ? <Loader2 className="size-4 animate-spin" /> : t('settings.team.resend')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={revokingId === invite.id}
                      onClick={() => void revokeInvite(invite.id)}
                    >
                      {revokingId === invite.id ? <Loader2 className="size-4 animate-spin" /> : t('settings.team.revoke')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('settings.team.dialogTitle')}</DialogTitle>
              <DialogDescription>{t('settings.team.dialogDescription')}</DialogDescription>
            </DialogHeader>
            <form className="grid gap-3 py-1" onSubmit={sendInvite}>
              <div className="grid gap-2">
                <Label htmlFor="invite-email">{t('settings.team.emailLabel')}</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('settings.team.emailPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('settings.team.roleLabel')}</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('admin.roleNames.admin')}</SelectItem>
                    <SelectItem value="editor">{t('admin.roleNames.editor')}</SelectItem>
                    <SelectItem value="user">{t('admin.roleNames.user')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {inviteError ? (
                <p className="text-destructive flex items-center gap-2 text-sm" role="alert">
                  <AlertCircle className="size-4" /> {inviteError}
                </p>
              ) : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  {t('settings.team.cancel')}
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {inviting ? t('settings.team.sending') : t('settings.team.send')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageBody>
    </Page>
  )
}
