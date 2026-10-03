'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Copy, CreditCard, Download, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { ApiResponse } from '@/lib/api/response'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { UsageBar } from '@/components/blocks/UsageBar'

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

interface BillingSettingsClientProps {
  justCheckedOut: boolean
}

export function BillingSettingsClient({ justCheckedOut }: BillingSettingsClientProps) {
  const t = useTranslations()
  const locale = useLocale()

  function fmt(n: number, unit: string) {
    return `${new Intl.NumberFormat(locale).format(n)}${unit}`
  }

  function fmtDate(value: string) {
    return new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalState, setPortalState] = useState<'idle' | 'opening' | 'error'>('idle')
  const [portalError, setPortalError] = useState<string | null>(null)
  const [checkoutState, setCheckoutState] = useState<'idle' | 'opening' | 'error'>('idle')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // WHY: the invoice id carries a copy button (clipboard with a
  // textarea fallback for non-secure contexts) so ids leave the page intact.
  async function copyInvoiceId(id: string) {    try {
      await navigator.clipboard.writeText(id)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = id
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    toast.success(t('dashboard.billing.copied'))
  }

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
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title="Billing"
          description="Plan, usage, payment method, and invoice history."
        />
      </PageHeader>
      <PageBody className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardDescription className="text-xs font-medium tracking-wider uppercase">Current plan</CardDescription>
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {subscription && (
                    <Badge
                      variant={
                        subscription.status === 'past_due'
                          ? 'warning'
                          : subscription.status === 'canceled'
                            ? 'secondary'
                            : 'success'
                      }
                      className="capitalize"
                    >
                      {subscription.status.replace('_', ' ')}
                    </Badge>
                  )}
                  {plan.renews && (
                    <Badge variant="secondary" className="text-xs">
                      Renews {plan.renews ? fmtDate(plan.renews) : null}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {justCheckedOut && !hasActiveSub && (
                <div className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <Loader2 className="text-primary size-4 animate-spin" />
                  Finalising your subscription… (Polar&apos;s webhook usually arrives in a second or two.)
                </div>
              )}
              {!subscription && (
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
                    <Button variant="outline" asChild>
                      <Link href="/#pricing">View plans</Link>
                    </Button>
                    <Button
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
              <div className="bg-muted/40 flex items-center gap-3 rounded-lg p-3">
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
              Resets {plan.renews ? fmtDate(plan.renews) : '—'}. Anything over the cap is billed
              at the overage rate (see plan details).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageThisCycle.map((usage) => (
              <UsageBar
                key={usage.label}
                label={usage.label}
                used={usage.used}
                limit={usage.limit}
                valueText={`${fmt(usage.used, usage.unit)} / ${fmt(usage.limit, usage.unit)}`}
              />
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
                <TableHead className="text-right">{t('dashboard.billing.amount')}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      {invoice.id}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded p-0.5 focus-visible:ring-2 focus-visible:outline-none"
                        aria-label={t('dashboard.billing.copyAria', { id: invoice.id })}
                        title={t('dashboard.billing.copyAria', { id: invoice.id })}
                        onClick={() => void copyInvoiceId(invoice.id)}
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs tabular-nums">{invoice.date}</TableCell>
                  <TableCell className="text-xs">{invoice.period}</TableCell>
                  <TableCell className="text-right tabular-nums">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-xs text-success capitalize">
                      <CheckCircle2 className="size-3" />
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{invoice.method}</TableCell>
                  <TableCell className="text-right">
                    {/* WHY: the download trigger is 32px with both
                        an accessible name and a tooltip. */}
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                             aria-label={t('dashboard.billing.downloadAria', { id: invoice.id })}
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('dashboard.billing.downloadAria', { id: invoice.id })}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </Page>
  )
}