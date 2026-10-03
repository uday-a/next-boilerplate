'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, AlertTriangle, Check, CloudOff, Copy, KeyRound, Loader2, Plus, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/lib/api/response'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

interface ApiKeyRow {
  id: number
  name: string
  prefix: string
  scopes: string
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
  sample?: boolean
}

function scopeBadges(scopes: string): string[] {
  return scopes.split(' ').filter(Boolean)
}

export default function ApiKeysSettingsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [pending, setPending] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)

  const [name, setName] = useState('')
  const [scope, setScope] = useState('read')
  const [expiry, setExpiry] = useState('90')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [showRaw, setShowRaw] = useState(false)
  const [rawKey, setRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokingId, setRevokingId] = useState<number | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRow | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function fmtDate(value: string | null): string {
    if (!value) return t('settings.apikeys.never')
    return new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
  }
  // Focus-return targets. Both dialogs below are controlled (`open` with no
  // DialogTrigger), so Radix cannot restore focus on close itself — store
  // the invoking trigger and focus it on Esc / close.
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const revokeTriggerRef = useRef<HTMLButtonElement>(null)
  // Demo sample rows are re-served on every fetch — track locally-dismissed
  // ones so a revoke sticks for the session.
  const [dismissedIds, setDismissedIds] = useState<readonly number[]>([])

  const load = useCallback(async () => {
    setPending(true)
    setFetchFailed(false)
    try {
      const res = await fetch('/api/keys', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<{ keys: ApiKeyRow[] }>
      if (json.ok) setKeys(json.data.keys.filter((k) => !dismissedIds.includes(k.id)))
      else setFetchFailed(true)
    } catch {
      setFetchFailed(true)
    } finally {
      setPending(false)
    }
  }, [dismissedIds])

  useEffect(() => {
    void load()
  }, [load])

  async function createKey(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || creating) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          scopes: scope.split(' '),
          ...(expiry === 'never' ? {} : { expiresInDays: Number(expiry) }),
        }),
      })
      const json = (await res.json()) as ApiResponse<{ key: ApiKeyRow; rawKey: string }>
      if (!json.ok) {
        setCreateError(json.error.message)
        return
      }
      setRawKey(json.data.rawKey)
      setShowRaw(true)
      setCopied(false)
      setName('')
      await load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(k: ApiKeyRow) {
    if (revokingId !== null) return
    setRevokeTarget(null)
    // Sample rows live only in the demo response — dismiss locally.
    if (k.sample) {
      setDismissedIds((d) => [...d, k.id])
      return
    }
    setRevokingId(k.id)
    setActionError(null)
    try {
      const res = await fetch(`/api/keys/${k.id}`, { method: 'DELETE' })
      const json = (await res.json()) as ApiResponse<{ revoked: number }>
      if (!json.ok) {
        setActionError(json.error.message)
        return
      }
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to revoke API key')
    } finally {
      setRevokingId(null)
      revokeTriggerRef.current?.focus()
    }
  }

  async function copyRaw() {
    if (!rawKey) return
    try {
      await navigator.clipboard.writeText(rawKey)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = rawKey
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function closeRaw() {
    setShowRaw(false)
    setRawKey(null)
    setCopied(false)
    createButtonRef.current?.focus()
  }

  function closeRevoke() {
    setRevokeTarget(null)
    revokeTriggerRef.current?.focus()
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={t('settings.apikeys.title')}
          description={t('settings.apikeys.description')}
        />
      </PageHeader>
      <PageBody className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.apikeys.createTitle')}</CardTitle>
            <CardDescription>{t('settings.apikeys.createDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 sm:grid-cols-[1fr_170px_150px_auto] sm:items-end" onSubmit={createKey}>
              <div className="grid gap-2">
                <Label htmlFor="ak-name">{t('settings.apikeys.nameLabel')}</Label>
                <Input
                  id="ak-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('settings.apikeys.namePlaceholder')}
                  maxLength={64}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ak-scope">{t('settings.apikeys.scopeLabel')}</Label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger id="ak-scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">{t('settings.apikeys.scopeRead')}</SelectItem>
                    <SelectItem value="read write">{t('settings.apikeys.scopeReadWrite')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ak-expiry">{t('settings.apikeys.expiryLabel')}</Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger id="ak-expiry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t('settings.apikeys.expiry30')}</SelectItem>
                    <SelectItem value="90">{t('settings.apikeys.expiry90')}</SelectItem>
                    <SelectItem value="never">{t('settings.apikeys.expiryNever')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" ref={createButtonRef} disabled={creating || !name.trim()}>
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {creating ? t('settings.apikeys.submitting') : t('settings.apikeys.submit')}
              </Button>
            </form>
            {createError ? (
              <div className="text-destructive mt-3 flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                {createError}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.apikeys.listTitle')}</CardTitle>
            <CardDescription>{t('settings.apikeys.listDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchFailed ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center" role="alert">
                <CloudOff className="text-muted-foreground size-8" aria-hidden="true" />
                <p className="text-sm font-medium">Couldn&apos;t load API keys</p>
                <p className="text-muted-foreground text-xs">Something went wrong on our side. Please try again.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => void load()}>
                  {t('settings.activity.states.retry')}
                </Button>
              </div>
            ) : pending ? (
              <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t('settings.apikeys.loading')}
              </div>
            ) : !keys.length ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <KeyRound className="text-muted-foreground size-8" aria-hidden="true" />
                <p className="text-sm font-medium">{t('settings.apikeys.emptyTitle')}</p>
                <p className="text-muted-foreground text-xs">{t('settings.apikeys.emptyDescription')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('settings.apikeys.colName')}</TableHead>
                    <TableHead>{t('settings.apikeys.colKey')}</TableHead>
                    <TableHead>{t('settings.apikeys.colScopes')}</TableHead>
                    <TableHead className="tabular-nums">{t('settings.apikeys.colCreated')}</TableHead>
                    <TableHead className="tabular-nums">{t('settings.apikeys.colExpires')}</TableHead>
                    <TableHead className="tabular-nums">{t('settings.apikeys.colLastUsed')}</TableHead>
                    <TableHead className="text-right">{t('settings.apikeys.colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id} className={cn(k.revokedAt && 'opacity-60')}>
                      <TableCell className="font-medium">
                        <span className="mr-2">{k.name}</span>
                        {k.sample ? <Badge variant="outline">Sample</Badge> : null}
                        {k.revokedAt ? <Badge variant="secondary">{t('settings.apikeys.revoked')}</Badge> : null}
                      </TableCell>
                      <TableCell>
                        <code className="text-muted-foreground font-mono text-xs">{k.prefix}…</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {scopeBadges(k.scopes).map((s) => (
                            <Badge key={s} variant="secondary">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs tabular-nums">{fmtDate(k.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs tabular-nums">{fmtDate(k.expiresAt)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs tabular-nums">
                        {k.lastUsedAt ? fmtDate(k.lastUsedAt) : t('settings.apikeys.neverUsed')}
                      </TableCell>
                      <TableCell className="text-right">
                        {!k.revokedAt ? (
                          <Button
                            variant="ghost"
                            size="icon"
                             aria-label={t('settings.apikeys.revokeAria', { name: k.name })}
                            disabled={revokingId === k.id}
                            onClick={(e) => {
                              revokeTriggerRef.current = e.currentTarget
                              setRevokeTarget(k)
                            }}
                          >
                            {revokingId === k.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="text-destructive size-4" />
                            )}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {actionError ? (
              <div className="text-destructive mt-3 flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                {actionError}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Dialog open={showRaw} onOpenChange={(open) => { if (!open) closeRaw() }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('settings.apikeys.rawTitle')}</DialogTitle>
              <DialogDescription>{t('settings.apikeys.rawDescription')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-1">
              <div className="bg-muted flex items-center gap-2 rounded-md border px-3 py-2">
                <code className="flex-1 font-mono text-xs break-all">{rawKey}</code>
                <Button variant="outline" size="sm" className="shrink-0" onClick={copyRaw}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? t('settings.apikeys.rawCopied') : t('settings.apikeys.rawCopy')}
                </Button>
              </div>
              <div className="border-warning/30 bg-warning/10 text-warning flex items-start gap-2 rounded-md border px-3 py-2">
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                <p className="text-xs">{t('settings.apikeys.rawWarning')}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={closeRaw}>{t('settings.apikeys.rawDone')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!revokeTarget} onOpenChange={(v) => { if (!v) closeRevoke() }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('settings.apikeys.revokeTitle', { name: revokeTarget?.name ?? '' })}</DialogTitle>
              <DialogDescription>{t('settings.apikeys.revokeDescription')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeRevoke}>
                {t('settings.apikeys.revokeCancel')}
              </Button>
              <Button variant="destructive" onClick={() => revokeTarget && void revokeKey(revokeTarget)}>
                <Trash2 className="size-4" aria-hidden="true" />
                {t('settings.apikeys.revoke')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </Page>
  )
}
