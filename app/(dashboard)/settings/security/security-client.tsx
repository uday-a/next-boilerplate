'use client'

import { useState } from 'react'
import { Key, Laptop, Smartphone, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { useTranslations } from 'next-intl'

const sessions = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome 130 · macOS 15',
    location: 'New York, US',
    current: true,
    lastActive: 'Active now',
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari · iOS 18',
    location: 'New York, US',
    current: false,
    lastActive: '2 hours ago',
  },
]

const tokens = [
  { id: 't1', name: 'CLI · build-server', scopes: ['read', 'write'], created: '2026-06-12', lastUsed: '2026-09-27' },
]

export function SecuritySettingsClient() {
  const t = useTranslations()
  const [mfaEnabled, setMfaEnabled] = useState(false)

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading title={t('nav.items.security')} description="Sessions, two-factor auth, and API tokens." />
      </PageHeader>
      <PageBody className="max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Two-factor authentication</CardTitle>
            <CardDescription>Require a code from your authenticator app on every sign-in.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="mfa-toggle" className="text-sm font-medium">
                  Authenticator app (TOTP)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Compatible with 1Password, Authy, Google Authenticator.
                </p>
              </div>
              <Switch id="mfa-toggle" checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active sessions</CardTitle>
            <CardDescription>Devices currently signed in to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session, index) => (
              <div key={session.id}>
                <div className="flex items-start justify-between gap-4 py-2">
                  <div className="flex items-start gap-3">
                    {session.device.includes('iPhone') ? (
                      <Smartphone className="text-muted-foreground mt-0.5 size-4" />
                    ) : (
                      <Laptop className="text-muted-foreground mt-0.5 size-4" />
                    )}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device}</p>
                        {session.current && (
                          <Badge variant="secondary">
                            This device
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {session.browser} · {session.location}
                      </p>
                      <p className="text-muted-foreground text-xs">{session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  )}
                </div>
                {index < sessions.length - 1 && <Separator />}
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" size="sm">
                Sign out all other sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">API tokens</CardTitle>
            <CardDescription>Personal access tokens for CLI and API use.</CardDescription>
            <CardAction>
              <Button size="sm">
                <Key className="size-4" />
                Create token
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {!tokens.length && <div className="text-muted-foreground text-sm">No tokens yet.</div>}
            {tokens.map((token) => (
              <div key={token.id} className="flex items-start justify-between gap-4 py-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{token.name}</p>
                    {token.scopes.map((scope) => (
                      <Badge key={scope} variant="secondary">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Created {token.created} · last used {token.lastUsed}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Revoke token">
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}