'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Pricing01 } from '@/components/blocks/Pricing01'
import type { ApiResponse } from '@/lib/api/response'

type Plan = 'pro' | 'team' | 'enterprise'

export function PricingClient() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ user: unknown }>>)
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false))
  }, [])

  async function onSubscribe(plan: Plan, _cycle: 'monthly' | 'yearly') {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent('/pricing')}`)
      return
    }

    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
      .then((r) => r.json() as Promise<ApiResponse<{ url: string }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Checkout failed' } }) as const)

    if (!res.ok) {
      alert(res.error.message)
      return
    }
    window.location.href = res.data.url
  }

  function onContactSales() {
    window.location.href = 'mailto:sales@example.com?subject=Enterprise%20plan%20inquiry'
  }

  return <Pricing01 onSubscribe={onSubscribe} onContactSales={onContactSales} />
}