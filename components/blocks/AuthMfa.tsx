'use client'

import * as React from 'react'
import { ShieldCheck, RotateCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/ui/pin-input'

export interface AuthMfaProps {
  title?: string
  description?: string
  continueHref?: string
  recoveryHref?: string
  demoCode?: string
  onVerify?: (code: string) => void
  onResend?: () => void
  onContinue?: () => void
}

export function AuthMfa({
  title,
  description,
  continueHref = '/',
  recoveryHref = '#',
  demoCode = '123456',
  onVerify,
  onResend,
  onContinue,
}: AuthMfaProps) {
  const t = useTranslations()
  const [code, setCode] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [resendIn, setResendIn] = React.useState(0)

  React.useEffect(() => {
    if (code.length === 6) {
      setError(false)
      setVerifying(true)
      onVerify?.(code)
      const timer = setTimeout(() => {
        setVerifying(false)
        if (code === demoCode) setVerified(true)
        else {
          setError(true)
          setCode('')
        }
      }, 700)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  function startResendCooldown() {
    setResendIn(30)
    onResend?.()
    const t = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        {!verified ? (
          <>
            <CardHeader className="text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
                <ShieldCheck className="size-6" />
              </div>
              <h1 className="text-2xl leading-tight font-semibold tracking-tight">{title ?? t('auth.mfa.title')}</h1>
              <CardDescription>{description ?? t('auth.mfa.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <PinInput value={code} onChange={setCode} disabled={verifying}>
                  <PinInputGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <PinInputSlot key={i} index={i} />
                    ))}
                  </PinInputGroup>
                </PinInput>
              </div>
              {verifying && <p className="text-muted-foreground text-center text-sm">{t('auth.mfa.verifying')}</p>}
              {error && (
                <p className="text-destructive text-center text-sm">{t('auth.mfa.invalidCode', { code: demoCode })}</p>
              )}
              <div className="text-center">
                {resendIn === 0 ? (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
                    onClick={startResendCooldown}
                  >
                    <RotateCw className="size-3.5" />{t('auth.mfa.resend')}
                  </button>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    {t('auth.mfa.resendCooldown', { seconds: resendIn })}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-muted-foreground text-xs">
                {t('auth.mfa.lostDevicePrefix')}{' '}
                <a href={recoveryHref} className="text-foreground underline-offset-4 hover:underline">
                  {t('auth.mfa.recoveryLink')}
                </a>
              </p>
            </CardFooter>
          </>
        ) : (
          <CardContent className="space-y-4 pt-4 text-center">
            <div className="bg-success/10 text-success mx-auto flex size-12 items-center justify-center rounded-full">
              <ShieldCheck className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight">{t('auth.mfa.verifiedTitle')}</h3>
              <p className="text-muted-foreground text-sm">{t('auth.mfa.verifiedDescription')}</p>
            </div>
            <Button asChild className="w-full">
              <a href={continueHref} onClick={() => onContinue?.()}>{t('auth.mfa.continue')}</a>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
