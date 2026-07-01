'use client'

import { useRouter } from 'next/navigation'
import { AuthMfa } from '@/components/blocks/AuthMfa'

export function MfaClient() {
  const router = useRouter()

  function onVerify(code: string) {
    console.warn('MFA verify (mock-only):', code)
  }

  function onContinue() {
    router.push('/dashboard')
  }

  return (
    <AuthMfa
      continueHref="/dashboard"
      recoveryHref="#"
      onVerify={onVerify}
      onContinue={onContinue}
    />
  )
}