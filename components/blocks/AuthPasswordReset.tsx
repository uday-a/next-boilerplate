'use client'

import * as React from 'react'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Stage = 'request' | 'sent' | 'reset' | 'done'

export interface AuthPasswordResetProps {
  signInHref?: string
  onRequest?: (email: string) => void
  onReset?: (password: string) => void
}

export function AuthPasswordReset({
  signInHref = '/login',
  onRequest,
  onReset,
}: AuthPasswordResetProps) {
  const t = useTranslations()
  const [stage, setStage] = React.useState<Stage>('request')

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const passwordsMatch = !confirm || password === confirm

  function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    onRequest?.(email)
    setStage('sent')
  }

  function submitReset(e: React.FormEvent) {
    e.preventDefault()
    if (!password || !passwordsMatch) return
    onReset?.(password)
    setStage('done')
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-4">
      <h1 className="sr-only">{t('auth.passwordReset.srTitle')}</h1>
      <Card className="w-full max-w-sm">
        {stage === 'request' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('auth.passwordReset.request.title')}</CardTitle>
              <CardDescription>{t('auth.passwordReset.request.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form method="post" className="space-y-4" onSubmit={submitRequest}>
                <div className="grid gap-2">
                  <Label htmlFor="reset-email">{t('auth.passwordReset.request.emailLabel')}</Label>
                  <Input
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder={t('auth.passwordReset.request.emailPlaceholder')}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('auth.passwordReset.request.submit')}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <a
                href={signInHref}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="size-4" />{t('auth.passwordReset.request.back')}
              </a>
            </CardFooter>
          </>
        )}

        {stage === 'sent' && (
          <CardContent className="space-y-4 pt-4 text-center">
            <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
              <MailCheck className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight">{t('auth.passwordReset.sent.title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('auth.passwordReset.sent.descriptionPrefix')}{' '}
                <span className="text-foreground font-medium">{email}</span>
                {t('auth.passwordReset.sent.descriptionSuffix')}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStage('reset')}>
              {t('auth.passwordReset.sent.openDemo')}
            </Button>
            <button
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
              onClick={() => setStage('request')}
            >
              {t('auth.passwordReset.sent.wrongEmail')}
            </button>
          </CardContent>
        )}

        {stage === 'reset' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('auth.passwordReset.reset.title')}</CardTitle>
              <CardDescription>{t('auth.passwordReset.reset.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form method="post" className="space-y-4" onSubmit={submitReset}>
                <div className="grid gap-2">
                  <Label htmlFor="reset-pw">{t('auth.passwordReset.reset.passwordLabel')}</Label>
                  <Input
                    id="reset-pw"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reset-confirm">{t('auth.passwordReset.reset.confirmLabel')}</Label>
                  <Input
                    id="reset-confirm"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!passwordsMatch}
                    required
                  />
                  {!passwordsMatch && <p className="text-destructive text-xs">{t('auth.passwordReset.reset.passwordsMismatch')}</p>}
                </div>
                <Button type="submit" className="w-full">
                  {t('auth.passwordReset.reset.submit')}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {stage === 'done' && (
          <CardContent className="space-y-4 pt-4 text-center">
            <div className="bg-success/10 text-success mx-auto flex size-12 items-center justify-center rounded-full">
              <MailCheck className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight">{t('auth.passwordReset.done.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('auth.passwordReset.done.description')}</p>
            </div>
            <Button asChild className="w-full">
              <a href={signInHref}>{t('auth.passwordReset.done.submit')}</a>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
