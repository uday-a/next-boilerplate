'use client'

import { AlertCircle, CheckCircle2, Mail, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthSignIn } from '@/components/blocks/AuthSignIn'
import { Button } from '@/components/ui/button'
import type { ApiResponse } from '@/lib/api/response'

type LinkState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; message: string }

export function LoginClient({ demoMode }: { demoMode: boolean }) {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
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
    window.location.href = `/api/auth/github?next=${encodeURIComponent(next)}`
  }

  return (
    <div className="relative">
      <AuthSignIn
        forgotPasswordHref="/forgot-password"
        signUpHref="/sign-up"
        oauthProviders={['github']}
        onSubmit={onSubmit}
        onOauth={onOauth}
      />

      {/* Top toast overlays -- same pattern as nuxt-boilerplate /login */}
      {(errorBanner || linkState.kind !== 'idle') && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          {errorBanner && (
            <div className="border-destructive/30 bg-background/95 text-destructive pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur">
              <AlertCircle className="size-4" />
              {errorBanner}
            </div>
          )}
          {!errorBanner && linkState.kind === 'sent' && (
            <div className="bg-background/95 pointer-events-auto flex items-center gap-2 rounded-full border border-emerald-500/30 px-4 py-2 text-sm text-emerald-700 shadow-lg backdrop-blur dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Sign-in link sent to <strong>{linkState.email}</strong>.
            </div>
          )}
          {!errorBanner && linkState.kind === 'error' && (
            <div className="border-destructive/30 bg-background/95 text-destructive pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur">
              <AlertCircle className="size-4" />
              {linkState.message}
            </div>
          )}
          {!errorBanner && linkState.kind === 'sending' && (
            <div className="bg-background/95 ring-border/60 pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur ring-1">
              <Mail className="size-4 animate-pulse" />
              Sending sign-in link…
            </div>
          )}
        </div>
      )}

      {/* Fixed bottom demo bar -- always visible when demo mode is on (nuxt-boilerplate parity) */}
      {demoEnabled && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 px-4">
          <div className="bg-background/95 ring-border/60 pointer-events-auto flex flex-wrap items-center justify-center gap-3 rounded-full border px-4 py-2 shadow-lg backdrop-blur ring-1">
            <Sparkles className="text-primary size-4" />
            <span className="text-muted-foreground text-sm">No GitHub OAuth configured.</span>
            <Button size="sm" disabled={demoLoading} onClick={signInAsDemo}>
              {demoLoading ? 'Signing in…' : 'Continue as demo user'}
            </Button>
          </div>
          {demoError && (
            <p className="bg-background/95 text-destructive pointer-events-auto rounded-full border px-3 py-1 text-xs shadow-sm">
              {demoError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}