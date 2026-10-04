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
    <div>
      <AuthPasswordReset signInHref="/login" onRequest={onRequest} />
      {/* Errors surface in a toast-style overlay rather than inside the card. */}
      {status === 'error' && (
        <div className="border-destructive/30 bg-background/95 text-destructive fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-md rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur">
          {errorMsg}
        </div>
      )}
    </div>
  )
}
