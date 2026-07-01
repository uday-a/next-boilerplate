'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

type Channel = { email: boolean; inApp: boolean }

const rows: { key: string; label: string; description: string }[] = [
  { key: 'mentions', label: 'Mentions', description: 'When someone @-mentions you in a comment or document.' },
  {
    key: 'comments',
    label: 'Comments on your items',
    description: 'New replies on threads you created or are subscribed to.',
  },
  { key: 'invites', label: 'Workspace invites', description: 'When you’re invited to a workspace or project.' },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'Mondays · top activity, usage, and outstanding tasks.',
  },
  { key: 'productUpdates', label: 'Product updates', description: 'New features, changelog highlights.' },
  { key: 'billing', label: 'Billing & invoices', description: 'Receipts, failed payments, plan changes.' },
]

const defaultPrefs: Record<string, Channel> = {
  mentions: { email: true, inApp: true },
  comments: { email: false, inApp: true },
  invites: { email: true, inApp: true },
  weeklyDigest: { email: true, inApp: false },
  productUpdates: { email: false, inApp: true },
  billing: { email: true, inApp: true },
}

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState(defaultPrefs)

  function updatePref(key: string, channel: keyof Channel, value: boolean) {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key]!, [channel]: value },
    }))
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm">Pick which channels receive which events.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery preferences</CardTitle>
          <CardDescription>Critical security alerts always send to email and can’t be disabled.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground grid grid-cols-[1fr_auto_auto] items-end gap-x-6 gap-y-1 pb-2 text-xs font-medium">
            <span>Event</span>
            <span className="px-1 text-center">Email</span>
            <span className="px-1 text-center">In-app</span>
          </div>
          <Separator />
          {rows.map((row, index) => (
            <div key={row.key}>
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 py-3">
                <div className="space-y-0.5">
                  <Label htmlFor={`pref-${row.key}-email`} className="text-sm font-medium">
                    {row.label}
                  </Label>
                  <p className="text-muted-foreground text-xs">{row.description}</p>
                </div>
                <Switch
                  id={`pref-${row.key}-email`}
                  checked={prefs[row.key]?.email ?? false}
                  onCheckedChange={(value) => updatePref(row.key, 'email', value)}
                />
                <Switch
                  id={`pref-${row.key}-inapp`}
                  checked={prefs[row.key]?.inApp ?? false}
                  onCheckedChange={(value) => updatePref(row.key, 'inApp', value)}
                />
              </div>
              {index < rows.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setPrefs(defaultPrefs)}>
          Reset
        </Button>
        <Button>Save preferences</Button>
      </div>
    </div>
  )
}