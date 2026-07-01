'use client'

import { useState } from 'react'
import { AuthPasswordReset } from '@/components/blocks/AuthPasswordReset'
import type { ApiResponse } from '@/lib/api/response'

export function ForgotPasswordClient() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function onRequest(email: string) {
    setStatus('sending')
    setErrorMsg('')

    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json() as Promise<ApiResponse<{ expiresInMin: number }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to send link' } }) as const)

    if (!res.ok) {
      setErrorMsg(res.error.message)
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  return (
    <div className="space-y-4">
      {status === 'sent' && (
        <p className="text-muted-foreground mx-auto max-w-sm text-center text-sm">
          If an account exists for that email, a sign-in link is on its way.
        </p>
      )}
      {status === 'error' && (
        <p className="text-destructive mx-auto max-w-sm text-center text-sm">{errorMsg}</p>
      )}
      <AuthPasswordReset signInHref="/login" onRequest={onRequest} />
    </div>
  )
}