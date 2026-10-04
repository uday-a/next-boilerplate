'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { formatMoney } from '@/lib/utils'
import { locales, normalizeLocale, setLocaleCookie } from '@/lib/i18n'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

const NOTIFICATION_OPTIONS = [
  { value: 'product', label: 'Product updates' },
  { value: 'security', label: 'Security alerts' },
  { value: 'billing', label: 'Billing & receipts' },
  { value: 'marketing', label: 'Marketing & promotions' },
]

export function FormsClient() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const [profile, setProfile] = useState({
    name: 'Alex Morgan',
    email: 'alex@acme.example',
    bio: 'Eng lead. Owns the platform team. Coffee → code → repeat.',
  })
  const [account, setAccount] = useState({
    password: '',
    timezone: 'utc',
    visibility: 'team' as 'private' | 'team' | 'public',
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: ['product', 'security'] as string[],
  })
  const [billing, setBilling] = useState({ seats: 12 })
  const [submitting, setSubmitting] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // Language preference is owned by next-intl: the cookie flushes immediately
  // and persists across reloads — no Save needed.
  function onLocaleChange(next: string) {
    if (next === locale) return
    setLocaleCookie(normalizeLocale(next))
    router.refresh()
  }

  function toggleNotification(value: string, checked: boolean) {
    const next = new Set(notifications.weekly)
    if (checked) next.add(value)
    else next.delete(value)
    setNotifications((n) => ({ ...n, weekly: Array.from(next) }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 700))
    setSubmitting(false)
    setSavedAt(new Date().toLocaleTimeString())
  }

  return (
    <form onSubmit={onSubmit}>
      <Page>
        <PageHeader>
          <PageHeaderHeading
            title={t('nav.items.forms')}
            description="Profile, account, notification and billing form patterns."
          />
        </PageHeader>
        <PageBody className="max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Public information shown alongside your activity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onValueChange={(v) => setProfile((p) => ({ ...p, bio: v }))}
                  rows={3}
                  maxLength={280}
                  placeholder="Tell people what you work on…"
                />
                <p className="text-muted-foreground text-xs tabular-nums">{profile.bio.length} / 280</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
              <CardDescription>Security and visibility settings.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  value={account.password}
                  onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
                  placeholder="Leave blank to keep current"
                  showPasswordToggle
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tz">Timezone</Label>
                <Select value={account.timezone} onValueChange={(v) => setAccount((a) => ({ ...a, timezone: v }))}>
                  <SelectTrigger id="tz">
                    <SelectValue placeholder="Pick a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC · Coordinated Universal Time</SelectItem>
                    <SelectItem value="pst">PST · Pacific (UTC−8)</SelectItem>
                    <SelectItem value="est">EST · Eastern (UTC−5)</SelectItem>
                    <SelectItem value="cet">CET · Central European (UTC+1)</SelectItem>
                    <SelectItem value="jst">JST · Japan (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="language">Language</Label>
                <Select value={locale} onValueChange={onLocaleChange}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">Applies right away — no need to save.</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Profile visibility</Label>
                <RadioGroup
                  value={account.visibility}
                  onValueChange={(v) => setAccount((a) => ({ ...a, visibility: v as typeof a.visibility }))}
                  className="sm:grid-cols-3"
                >
                  {[
                    { value: 'private', title: 'Private', desc: 'Only you can see this profile.' },
                    { value: 'team', title: 'Team', desc: 'Anyone in your workspace.' },
                    { value: 'public', title: 'Public', desc: 'Anyone with the link.' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="hover:bg-muted/50 has-[[data-state=checked]]:border-primary flex w-full cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors"
                    >
                      <RadioGroupItem value={opt.value} className="mt-0.5" />
                      <div className="flex-1 space-y-0.5">
                        <div className="text-sm font-medium leading-none">{opt.title}</div>
                        <div className="text-muted-foreground text-xs">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Pick the channels and topics you want to hear about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-email">Email notifications</Label>
                  <p className="text-muted-foreground text-xs">Daily digest of activity in your workspace.</p>
                </div>
                <Switch
                  id="notify-email"
                  checked={notifications.email}
                  onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-push">Push notifications</Label>
                  <p className="text-muted-foreground text-xs">Real-time on mobile when something needs your attention.</p>
                </div>
                <Switch
                  id="notify-push"
                  checked={notifications.push}
                  onCheckedChange={(v) => setNotifications((n) => ({ ...n, push: v }))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Weekly digest topics</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {NOTIFICATION_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors"
                    >
                      <Checkbox
                        checked={notifications.weekly.includes(opt.value)}
                        onCheckedChange={(v) => toggleNotification(opt.value, Boolean(v))}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Billing</CardTitle>
              <CardDescription>Seats and plan size. Charged monthly at $12/seat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="billing-seats">Team seats</Label>
                  {/* WHY: billing math formats through the shared
                      helper and the /mo unit sits muted so the figure scans. */}
                  <span className="text-sm tabular-nums">
                    {billing.seats} seats · {formatMoney(billing.seats * 12)}
                    <span className="text-muted-foreground">/mo</span>
                  </span>
                </div>
                <Slider
                  id="billing-seats"
                  value={[billing.seats]}
                  onValueChange={(v) => setBilling({ seats: v[0] ?? 1 })}
                  min={1}
                  max={50}
                  step={1}
                  aria-label="Team seats"
                />
                <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2">
            {savedAt ? (
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs" role="status">
                <Check className="text-success size-3.5" aria-hidden="true" />
                Saved at {savedAt}
              </span>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {submitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </PageBody>
      </Page>
    </form>
  )
}