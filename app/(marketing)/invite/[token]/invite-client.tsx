'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AlertCircle, Loader2, Mail, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiResponse } from '@/lib/api/response'

interface InvitePreview {
  email: string
  role: string
  valid: boolean
}

/**
 * Token verify + accept flow. Port of Nuxt `invite/[token].vue` @462c304:
 * a 401 shows a sign-in prompt instead of "invalid link"; an email
 * mismatch tells the user to sign in as the invited address.
 * GET/POST `/api/team/invites/:token` — the token IS the auth.
 */
export function InviteClient({ token }: { token: string }) {
  const router = useRouter()
  const t = useTranslations()
  const [invite, setInvite] = useState<InvitePreview | null>(null)
  const [verifying, setVerifying] = useState(true)
  const [verifyFailed, setVerifyFailed] = useState(false)
  const [needsSignin, setNeedsSignin] = useState(false)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function verify() {
      setVerifying(true)
      setVerifyFailed(false)
      setNeedsSignin(false)
      try {
        const res = await fetch(`/api/team/invites/${token}`, { cache: 'no-store' })
        const json = (await res.json()) as ApiResponse<InvitePreview>
        if (cancelled) return
        if (json.ok) {
          setInvite(json.data)
        } else {
          if (res.status === 401 || json.error.code === 'UNAUTHORIZED') setNeedsSignin(true)
          else setVerifyFailed(true)
        }
      } catch {
        if (!cancelled) setVerifyFailed(true)
      } finally {
        if (!cancelled) setVerifying(false)
      }
    }
    void verify()
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: { email: string } }>>)
      .then((res) => {
        if (!cancelled && res.ok) setLoggedInEmail(res.data.user.email)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [token])

  const emailMismatch = Boolean(
    invite && loggedInEmail && loggedInEmail.toLowerCase() !== invite.email.toLowerCase(),
  )
  const signinHref = `/login?next=/invite/${token}`

  async function accept() {
    if (!loggedInEmail) {
      router.push(signinHref)
      return
    }
    setAccepting(true)
    setAcceptError(null)
    try {
      const res = await fetch(`/api/team/invites/${token}`, { method: 'POST' })
      const json = (await res.json()) as ApiResponse<{ accepted: boolean }>
      if (!json.ok) {
        setAcceptError(json.error.message)
        setAccepting(false)
        return
      }
      router.push('/dashboard')
    } catch {
      setAcceptError(t('invite.acceptFailed'))
      setAccepting(false)
    }
  }

  function decline() {
    router.push('/')
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <a
        href="#main-content"
        className="bg-background text-foreground ring-ring sr-only z-50 rounded-md text-sm font-medium shadow-md ring-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-4 outline-none">
        {verifying ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t('invite.loading')}
          </div>
        ) : invite && !verifyFailed && !needsSignin ? (
          <Card>
            <CardHeader className="items-center text-center">
              <CardTitle className="pt-3 text-2xl">{t('invite.joinTitle')}</CardTitle>
              <CardDescription>{t('invite.description', { role: invite.role })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Mail className="size-4" aria-hidden="true" />
                <span>
                  {t('invite.invitedEmail')}: <span className="text-foreground">{invite.email}</span>
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Users className="size-4" aria-hidden="true" />
                <span>
                  {t('invite.roleLabel')}: <span className="text-foreground">{invite.role}</span>
                </span>
              </div>
              {emailMismatch ? (
                <div className="text-muted-foreground text-center text-xs">
                  {t('invite.needSignin', { email: invite.email })}
                </div>
              ) : null}
              {acceptError ? (
                <div className="text-destructive flex items-center gap-2 text-sm">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  {acceptError}
                </div>
              ) : null}
              <div className="flex flex-col gap-2 pt-2">
                <Button className="w-full" disabled={accepting} onClick={accept}>
                  {accepting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {accepting ? t('invite.accepting') : loggedInEmail && !emailMismatch ? t('invite.accept') : t('invite.signinCta')}
                </Button>
                <Button variant="ghost" className="w-full" onClick={decline}>
                  {t('invite.decline')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : needsSignin ? (
          <Card>
            <CardHeader className="items-center text-center">
              <CardTitle className="pt-3 text-2xl">{t('invite.signinTitle')}</CardTitle>
              <CardDescription>{t('invite.signinDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href={signinHref}>{t('invite.signinCta')}</Link>
              </Button>
              <Button variant="ghost" className="w-full" onClick={decline}>
                {t('invite.backHome')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="items-center text-center">
              <CardTitle className="pt-3 text-2xl">{t('invite.invalidTitle')}</CardTitle>
              <CardDescription>{t('invite.invalidDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={decline}>
                {t('invite.backHome')}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
