'use client'

import { Mail, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiResponse } from '@/lib/api/response'

const invite = {
  workspace: 'Acme Inc',
  role: 'Member',
  inviter: { name: 'Alice Chen', email: 'alice@acme.com' },
  email: 'you@acme.com',
}

export function InviteClient({ token }: { token: string }) {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: unknown }>>)
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false))
  }, [])

  const initials = useMemo(
    () =>
      invite.inviter.name
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [],
  )

  function accept() {
    if (!loggedIn) {
      router.push(`/login?next=/invite/${token}`)
      return
    }
    router.push('/dashboard')
  }

  function decline() {
    router.push('/')
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="size-12">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="pt-3 text-xl">Join {invite.workspace}</CardTitle>
            <CardDescription>
              <span className="text-foreground font-medium">{invite.inviter.name}</span> invited you to join{' '}
              <span className="text-foreground font-medium">{invite.workspace}</span> as a {invite.role}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Mail className="size-4" />
              <span>
                Invited email: <span className="text-foreground">{invite.email}</span>
              </span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Users className="size-4" />
              <span>
                Role: <span className="text-foreground">{invite.role}</span>
              </span>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button className="w-full" onClick={accept}>
                Accept invite
              </Button>
              <Button variant="ghost" className="w-full" onClick={decline}>
                Decline
              </Button>
            </div>
            <p className="text-muted-foreground text-center text-xs">
              Token: <code>{token}</code>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}