'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { ApiResponse } from '@/lib/api/response'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { useTranslations } from 'next-intl'

// Brand accent is picked from the theme's chart palette so it stays
// legible in light and dark mode.
const brandSwatches = [
  { value: 'chart-1', label: 'Color 1', className: 'bg-chart-1' },
  { value: 'chart-2', label: 'Color 2', className: 'bg-chart-2' },
  { value: 'chart-3', label: 'Color 3', className: 'bg-chart-3' },
  { value: 'chart-4', label: 'Color 4', className: 'bg-chart-4' },
  { value: 'chart-5', label: 'Color 5', className: 'bg-chart-5' },
]

interface Profile {
  name: string | null
  bio: string | null
  timezone: string
  locale: string
  notifyEmail: boolean
  notifyInApp: boolean
}

type Status =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; demo?: boolean }
  | { kind: 'error'; message: string }

export function GeneralSettingsClient() {
  const t = useTranslations()
  const [timezone, setTimezone] = useState('UTC')
  const [locale, setLocale] = useState('en')
  const [workspaceName, setWorkspaceName] = useState('Acme Inc')
  const [workspaceUrl, setWorkspaceUrl] = useState('acme-inc')
  const [supportEmail, setSupportEmail] = useState('support@acme.com')
  const [brandColor, setBrandColor] = useState('chart-1')
  const [allowExternalShares, setAllowExternalShares] = useState(true)
  const [requireSso, setRequireSso] = useState(false)
  const [sendWeeklyDigest, setSendWeeklyDigest] = useState(true)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const loadProfile = useCallback(async () => {
    const res = await fetch('/api/me/profile', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ profile: Profile }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to load profile' } } as const))

    if (!res.ok) {
      setStatus({ kind: 'error', message: res.error.message })
      return
    }

    setTimezone(res.data.profile.timezone)
    setLocale(res.data.profile.locale)
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  async function save() {
    setStatus({ kind: 'saving' })
    const res = await fetch('/api/me/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone, locale }),
    })
      .then((r) => r.json() as Promise<ApiResponse<{ profile: Profile; demo?: boolean }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to save' } } as const))

    if (!res.ok) {
      setStatus({ kind: 'error', message: res.error.message })
      return
    }

    setStatus({ kind: 'saved', demo: res.data.demo })
    await loadProfile()
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={t('nav.items.general')}
          description="Workspace identity, locale, and default behavior."
        />
      </PageHeader>
      <PageBody className="max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
            <CardDescription>Visible to every member.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input id="ws-name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-url">URL slug</Label>
              <div className="flex">
                <span className="bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
                  app.acme.com/
                </span>
                <Input
                  id="ws-url"
                  value={workspaceUrl}
                  onChange={(e) => setWorkspaceUrl(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Renaming the slug breaks existing share links. Old links 404; we don&apos;t redirect.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-email">Support email</Label>
              <Input
                id="ws-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Localization</CardTitle>
            <CardDescription>Affects date and time formatting across the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ws-timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="ws-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles · UTC-8</SelectItem>
                  <SelectItem value="America/New_York">America/New_York · UTC-5</SelectItem>
                  <SelectItem value="Europe/London">Europe/London · UTC+0</SelectItem>
                  <SelectItem value="Europe/Berlin">Europe/Berlin · UTC+1</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore · UTC+8</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo · UTC+9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-locale">Locale</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger id="ws-locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label id="ws-brand-label">Primary brand color</Label>
              <div className="flex items-center gap-2" role="radiogroup" aria-labelledby="ws-brand-label">
                {brandSwatches.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={brandColor === c.value}
                    aria-label={c.label}
                    className={cn(
                      'ring-offset-background focus-visible:ring-ring size-8 rounded-full border transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      c.className,
                      brandColor === c.value && 'ring-foreground ring-2 ring-offset-2',
                    )}
                    onClick={() => setBrandColor(c.value)}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Used on shared report headers, exported PDFs, and the public-facing share page.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="allow-external-shares" className="text-sm font-medium">
                  Allow external shares
                </Label>
                <p className="text-muted-foreground text-xs">
                  Members can generate public read-only share links. Disabled by default at the Enterprise tier.
                </p>
              </div>
              <Switch
                id="allow-external-shares"
                checked={allowExternalShares}
                onCheckedChange={setAllowExternalShares}
              />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="require-sso" className="text-sm font-medium">
                  Require SSO
                </Label>
                <p className="text-muted-foreground text-xs">
                  All members must authenticate via your SAML or OIDC provider. Email/password is blocked.
                </p>
              </div>
              <Switch id="require-sso" checked={requireSso} onCheckedChange={setRequireSso} />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="send-weekly-digest" className="text-sm font-medium">
                  Send weekly digest
                </Label>
                <p className="text-muted-foreground text-xs">
                  Mondays at 9am workspace time. Usage, top projects, and any rate-limit hits from the prior week.
                </p>
              </div>
              <Switch
                id="send-weekly-digest"
                checked={sendWeeklyDigest}
                onCheckedChange={setSendWeeklyDigest}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          {status.kind === 'saved' && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="size-4" />
              {status.demo ? 'Saved (demo — not persisted)' : 'Saved'}
            </div>
          )}
          {status.kind === 'error' && (
            <div className="text-destructive flex items-center gap-2 text-sm">
              <AlertCircle className="size-4" />
              {status.message}
            </div>
          )}
          <Button variant="outline">Cancel</Button>
          <Button disabled={status.kind === 'saving'} onClick={() => void save()}>
            {status.kind === 'saving' && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </PageBody>
    </Page>
  )
}