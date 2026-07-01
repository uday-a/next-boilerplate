'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { ApiResponse } from '@/lib/api/response'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

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
  | { kind: 'loading' }
  | { kind: 'saving' }
  | { kind: 'saved'; demo?: boolean }
  | { kind: 'error'; message: string }

interface AccountSettingsClientProps {
  userEmail: string
  userAvatar: string | null
  sessionName: string
}

export function AccountSettingsClient({ userEmail, userAvatar, sessionName }: AccountSettingsClientProps) {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'loading' })

  const initials = useMemo(
    () =>
      (name || 'U')
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [name],
  )

  const loadProfile = useCallback(async () => {
    setStatus({ kind: 'loading' })
    const res = await fetch('/api/me/profile', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ profile: Profile }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to load profile' } } as const))

    if (!res.ok) {
      setStatus({ kind: 'error', message: res.error.message })
      return
    }

    setName(res.data.profile.name ?? sessionName)
    setBio(res.data.profile.bio ?? '')
    setStatus({ kind: 'idle' })
  }, [sessionName])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  async function save() {
    setStatus({ kind: 'saving' })
    const res = await fetch('/api/me/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio: bio || null }),
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

  if (status.kind === 'loading') {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading account…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground text-sm">Your personal profile and credentials.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How you appear in the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {userAvatar && <AvatarImage src={userAvatar} alt={name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button variant="outline" size="sm">
                Upload photo
              </Button>
              <p className="text-muted-foreground text-xs">PNG or JPG, up to 2MB.</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acct-name">Full name</Label>
            <Input id="acct-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acct-bio">Bio</Label>
            <Textarea
              id="acct-bio"
              value={bio}
              onValueChange={setBio}
              rows={3}
              placeholder="A short paragraph about yourself."
            />
            <p className="text-muted-foreground text-xs">500 characters max. Visible to workspace members.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acct-email">Email</Label>
            <Input id="acct-email" type="email" value={userEmail} disabled />
            <p className="text-muted-foreground text-xs">
              Email comes from your GitHub account. Change it there or add email/password auth to edit here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Use 12+ characters with a mix of letters, numbers, and symbols.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="pw-current">Current password</Label>
            <Input
              id="pw-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-new">New password</Label>
            <Input
              id="pw-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input
              id="pw-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive text-base">Danger zone</CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-muted-foreground text-xs">
                Permanently remove your account and all personal data. Workspace data is retained per your billing
                plan.
              </p>
            </div>
            <Button variant="destructive">Delete account</Button>
          </div>
          <Separator />
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Export data</p>
              <p className="text-muted-foreground text-xs">Download a JSON archive of your personal data.</p>
            </div>
            <Button variant="outline">Request export</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {status.kind === 'saved' && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
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
        <Button disabled={status.kind === 'saving' || !name} onClick={() => void save()}>
          {status.kind === 'saving' && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </div>
  )
}