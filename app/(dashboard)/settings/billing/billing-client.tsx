'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, CreditCard, Download, Loader2 } from 'lucide-react'
import type { ApiResponse } from '@/lib/api/response'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Plan = 'pro' | 'team' | 'enterprise'

interface SubscriptionRow {
  status: string
  productId: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  plan: Plan | null
}

const usageThisCycle = [
  { label: 'API calls', used: 482300, limit: 1000000, unit: '' },
  { label: 'Compute (hours)', used: 127.4, limit: 250, unit: 'h' },
  { label: 'Storage', used: 38.2, limit: 100, unit: 'GB' },
  { label: 'Team seats', used: 8, limit: 25, unit: '' },
]

const invoices = [
  { id: 'INV-2031', date: '2026-05-01', period: 'Apr 2026', amount: 148.4, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-2018', date: '2026-04-01', period: 'Mar 2026', amount: 148.4, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1994', date: '2026-03-01', period: 'Feb 2026', amount: 145.0, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1972', date: '2026-02-01', period: 'Jan 2026', amount: 145.0, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1948', date: '2026-01-01', period: 'Dec 2025', amount: 145.0, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1923', date: '2025-12-01', period: 'Nov 2025', amount: 133.0, status: 'paid', method: 'Visa ··4242' },
]

function pct(used: number, limit: number) {
  return Math.min(100, Math.round((used / limit) * 100))
}

function fmt(n: number, unit: string) {
  return `${n.toLocaleString()}${unit}`
}

interface BillingSettingsClientProps {
  justCheckedOut: boolean
}

export function BillingSettingsClient({ justCheckedOut }: BillingSettingsClientProps) {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalState, setPortalState] = useState<'idle' | 'opening' | 'error'>('idle')
  const [portalError, setPortalError] = useState<string | null>(null)
  const [checkoutState, setCheckoutState] = useState<'idle' | 'opening' | 'error'>('idle')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const hasActiveSub = useMemo(
    () => subscription && ['active', 'trialing', 'past_due'].includes(subscription.status),
    [subscription],
  )

  const plan = useMemo(() => {
    if (!subscription) {
      return { name: 'Free', price: 0, cycle: '—', renews: null as string | null }
    }
    const label = subscription.plan
      ? subscription.plan[0]!.toUpperCase() + subscription.plan.slice(1)
      : 'Subscribed'
    return {
      name: label,
      price: 0,
      cycle: '—',
      renews: subscription.currentPeriodEnd,
    }
  }, [subscription])

  const loadSubscription = useCallback(async () => {
    const res = await fetch('/api/me/subscription', { cache: 'no-store' })
      .then((r) => r.json() as Promise<ApiResponse<{ subscription: SubscriptionRow | null }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Failed to load subscription' } } as const))

    if (res.ok) {
      setSubscription(res.data.subscription)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadSubscription()
  }, [loadSubscription])

  useEffect(() => {
    if (!justCheckedOut) return

    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const res = await fetch('/api/me/subscription', { cache: 'no-store' })
        .then((r) => r.json() as Promise<ApiResponse<{ subscription: SubscriptionRow | null }>>)
        .catch(() => null)

      if (res?.ok) {
        setSubscription(res.data.subscription)
        const active =
          res.data.subscription &&
          ['active', 'trialing', 'past_due'].includes(res.data.subscription.status)
        if (active || attempts >= 6) clearInterval(interval)
      } else if (attempts >= 6) {
        clearInterval(interval)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [justCheckedOut])

  async function openPortal() {
    setPortalState('opening')
    setPortalError(null)
    const res = await fetch('/api/billing/portal', { method: 'POST' })
      .then((r) => r.json() as Promise<ApiResponse<{ url: string }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Could not open portal' } } as const))

    if (!res.ok) {
      setPortalError(res.error.message)
      setPortalState('error')
      return
    }

    window.location.href = res.data.url
  }

  async function startCheckout(plan: Plan) {
    setCheckoutState('opening')
    setCheckoutError(null)
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
      .then((r) => r.json() as Promise<ApiResponse<{ url: string }>>)
      .catch(() => ({ ok: false, error: { code: 'INTERNAL', message: 'Checkout failed' } } as const))

    if (!res.ok) {
      setCheckoutError(res.error.message)
      setCheckoutState('error')
      return
    }

    window.location.href = res.data.url
  }

  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading billing…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm">Plan, usage, payment method, and invoice history.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription className="text-xs tracking-wider uppercase">Current plan</CardDescription>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </div>
              {plan.renews && (
                <Badge variant="secondary" className="text-[10px]">
                  Renews {new Date(plan.renews).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {justCheckedOut && !hasActiveSub && (
              <div className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Loader2 className="text-primary size-4 animate-spin" />
                Finalising your subscription… (Polar&apos;s webhook usually arrives in a second or two.)
              </div>
            )}
            {subscription ? (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums capitalize">{subscription.status}</span>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                You&apos;re on the free tier. Upgrade for more seats, integrations, and priority support.
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {hasActiveSub ? (
                <Button disabled={portalState === 'opening'} onClick={() => void openPortal()}>
                  {portalState === 'opening' ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  Manage subscription
                </Button>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/#pricing">View plans</Link>
                  </Button>
                  <Button
                    variant="outline"
                    disabled={checkoutState === 'opening'}
                    onClick={() => void startCheckout('pro')}
                  >
                    {checkoutState === 'opening' && <Loader2 className="size-4 animate-spin" />}
                    Upgrade to Pro
                  </Button>
                </>
              )}
            </div>
            {portalError && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                {portalError}
              </div>
            )}
            {checkoutError && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                {checkoutError}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
              <CreditCard className="text-muted-foreground size-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Visa ending in 4242</p>
                <p className="text-muted-foreground text-xs">Expires 09 / 28</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Update card
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage this cycle</CardTitle>
          <CardDescription>
            Resets {plan.renews ? new Date(plan.renews).toLocaleDateString() : '—'}. Anything over the cap is billed
            at the overage rate (see plan details).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {usageThisCycle.map((usage) => (
            <div key={usage.label} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{usage.label}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {fmt(usage.used, usage.unit)} / {fmt(usage.limit, usage.unit)}
                </span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${pct(usage.used, usage.limit)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
          <CardDescription>PDF downloads stay available for 7 years.</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-mono text-xs">{invoice.id}</TableCell>
                <TableCell className="text-muted-foreground text-xs tabular-nums">{invoice.date}</TableCell>
                <TableCell className="text-xs">{invoice.period}</TableCell>
                <TableCell className="text-right tabular-nums">${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 capitalize dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{invoice.method}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="size-7">
                    <Download className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}