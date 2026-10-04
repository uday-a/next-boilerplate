'use client'

import { AlertCircle, Mail, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthSignIn } from '@/components/blocks/AuthSignIn'
import { Button } from '@/components/ui/button'
import type { ApiResponse } from '@/lib/api/response'
import { safeRedirectPath } from '@/lib/auth/redirect'

type LinkState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; message: string }

export function LoginClient({ demoMode }: { demoMode: boolean }) {
  const searchParams = useSearchParams()
  const next = safeRedirectPath(searchParams.get('next'))
  const errorCode = searchParams.get('error')

  const [demoEnabled, setDemoEnabled] = useState(demoMode)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [linkState, setLinkState] = useState<LinkState>({ kind: 'idle' })

  useEffect(() => {
    fetch('/api/auth/demo', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { enabled?: boolean }) => {
        if (typeof data.enabled === 'boolean') setDemoEnabled(data.enabled)
      })
      .catch(() => undefined)
  }, [])

  const errorBanner = (() => {
    switch (errorCode) {
      case 'magic-link-expired':
        return 'That sign-in link expired. Request a fresh one below.'
      case 'magic-link-used':
        return 'That sign-in link was already used. Request a fresh one below.'
      case 'magic-link-invalid':
        return 'That sign-in link is invalid. Request a fresh one below.'
      case 'magic-link-missing-token':
        return 'Sign-in link was missing a token. Request a fresh one below.'
      case 'magic-link-db-required':
        return 'Magic-link sign-in needs a DATABASE_URL configured. Use GitHub instead.'
      case 'magic-link-failed':
        return 'Sign-in failed. Try again or use GitHub.'
      case 'oauth':
        return 'GitHub sign-in failed. Try again.'
      default:
        return null
    }
  })()

  async function signInAsDemo() {
    setDemoLoading(true)
    setDemoError(null)
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST', credentials: 'same-origin' })
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!res.ok) {
        setDemoError(body?.error ?? 'Demo sign-in failed. Set DEMO_MODE=true in Vercel and redeploy.')
        return
      }
      window.location.assign(next)
    } finally {
      setDemoLoading(false)
    }
  }

  async function onSubmit(payload: { email: string }) {
    setLinkState({ kind: 'sending' })
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: payload.email }),
    })
      .then((r) => r.json() as Promise<ApiResponse<{ expiresInMin: number }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to send link' } }) as const)

    if (!res.ok) {
      setLinkState({ kind: 'error', message: res.error.message })
      return
    }
    setLinkState({ kind: 'sent', email: payload.email })
  }

  function onOauth(provider: 'github' | 'google') {
    if (provider !== 'github') {
      alert('Only GitHub OAuth is wired right now.')
      return
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- API endpoint redirects to external OAuth provider
    window.location.href = `/api/auth/github?next=${encodeURIComponent(next)}`
  }

  return (
    <div className="bg-background relative flex min-h-svh items-center justify-center p-4 md:p-4">
      <div className="w-full max-w-sm">
        <AuthSignIn
          forgotPasswordHref="/forgot-password"
          signUpHref="/sign-up"
          oauthProviders={['github']}
          onSubmit={onSubmit}
          onOauth={onOauth}
        />

        {/* Top toast overlays -- error banner on bad magic link, confirmation on send */}
        {errorBanner && (
          <div className="fixed top-6 right-6 z-50 max-w-sm">
            <div className="bg-popover text-destructive border-destructive/30 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-lg">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>{errorBanner}</span>
            </div>
          </div>
        )}

        {linkState.kind === 'sent' && (
          <div className="fixed top-6 right-6 z-50 max-w-sm">
            <div className="bg-popover text-popover-foreground flex items-center gap-2 rounded-lg border p-4 text-sm shadow-lg">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span>
                Sign-in link sent to <strong className="font-semibold">{linkState.email}</strong>. Check your inbox.
              </span>
            </div>
          </div>
        )}

        {linkState.kind === 'error' && (
          <div className="fixed top-6 right-6 z-50 max-w-sm">
            <div className="bg-popover text-destructive border-destructive/30 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-lg">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>{linkState.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating demo affordance -- only shown in demo mode, outside the auth card. */}
      {demoEnabled && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 px-4">
          <div className="bg-background/95 flex items-center gap-3 rounded-full border px-4 py-2 shadow-lg backdrop-blur">
            <Sparkles className="text-primary size-4" aria-hidden="true" />
            <span className="text-muted-foreground text-sm">Just looking around? Try the demo workspace.</span>
            <Button size="sm" disabled={demoLoading} onClick={signInAsDemo}>
              {demoLoading ? 'Signing in…' : 'Continue as demo user'}
            </Button>
          </div>
          {demoError && (
            <p className="bg-background/95 text-destructive rounded-full border px-3 py-1 text-xs shadow-sm">
              {demoError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
