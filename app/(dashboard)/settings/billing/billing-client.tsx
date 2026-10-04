'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Copy, CreditCard, Download, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { ApiResponse } from '@/lib/api/response'
import { DemoDataBanner } from '@/components/blocks/DemoDataBanner'
import { UsageBar } from '@/components/blocks/UsageBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SAMPLE_INVOICES, SAMPLE_PLAN, SAMPLE_USAGE, usageText } from '@/lib/usage-mock'

interface SubscriptionRow {
  status: string
  productId: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  plan: 'pro' | 'team' | 'enterprise' | null
}

const usageThisCycle = SAMPLE_USAGE.filter((u) => u.billable)
const invoices = SAMPLE_INVOICES

interface BillingSettingsClientProps {
  justCheckedOut: boolean
}

export function BillingSettingsClient({ justCheckedOut }: BillingSettingsClientProps) {
  const t = useTranslations()
  const locale = useLocale()

  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalState, setPortalState] = useState<'idle' | 'opening' | 'error'>('idle')
  const [portalError, setPortalError] = useState<string | null>(null)

  // WHY: the invoice id carries a copy button (clipboard with a
  // textarea fallback for non-secure contexts) so ids leave the page intact.
  async function copyInvoiceId(id: string) {
    try {
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

  // Derive the displayed plan from the real subscription. Without one the
  // page shows the shared sample plan (lib/usage-mock) so plan, usage and
  // invoices agree with each other and with Settings -> Limits.
  const isSample = !subscription
  const plan = useMemo(() => {
    if (!subscription) return { name: SAMPLE_PLAN.name, price: SAMPLE_PLAN.price as number | null, renews: SAMPLE_PLAN.renews as string | null }
    const label = subscription.plan ? subscription.plan[0]!.toUpperCase() + subscription.plan.slice(1) : 'Subscribed'
    return { name: label, price: null, renews: subscription.currentPeriodEnd }
  }, [subscription])
  const renewsLabel = plan.renews
    ? new Date(plan.renews).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

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

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading title={t('nav.items.billing')} description="Plan, usage, payment method, and invoice history." />
      </PageHeader>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading billing…
        </div>
      ) : (
      <PageBody className="space-y-4">
        {isSample ? (
          <DemoDataBanner message="Sample billing data. Your plan and invoices appear here once you subscribe." />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium tracking-wider uppercase">Current plan</CardDescription>
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <CardAction>
                <Badge variant="secondary">{renewsLabel ? `Renews ${renewsLabel}` : 'No renewal date'}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              {justCheckedOut && !hasActiveSub ? (
                <div className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <Loader2 className="text-primary size-4 animate-spin" aria-hidden="true" />
                  Finalizing your subscription…
                </div>
              ) : subscription ? (
                <p className="text-sm capitalize">{subscription.status}</p>
              ) : plan.price !== null ? (
                <p className="text-sm">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">${plan.price}</span>
                  <span className="text-muted-foreground"> / {SAMPLE_PLAN.cycle}</span>
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {hasActiveSub ? (
                  <Button disabled={portalState === 'opening'} onClick={() => void openPortal()}>
                    {portalState === 'opening' ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CreditCard className="size-4" aria-hidden="true" />
                    )}
                    Manage subscription
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/pricing">Change plan</Link>
                  </Button>
                )}
              </div>
              {portalError ? (
                <div className="text-destructive flex items-center gap-2 text-sm">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  {portalError}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <CreditCard className="text-muted-foreground size-5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-muted-foreground text-xs tabular-nums">Expires 09 / 28</p>
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
              {renewsLabel ? `Resets ${renewsLabel}.` : 'Resets at the start of each billing cycle.'} Anything over the
              cap is billed at the overage rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageThisCycle.map((u) => (
              <UsageBar
                key={u.id}
                label={u.label}
                used={u.used}
                limit={u.limit}
                valueText={usageText(u)}
                scope={u.period === 'cycle' ? 'this cycle' : 'workspace total'}
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
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      {inv.id}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded p-0.5 focus-visible:ring-2 focus-visible:outline-none"
                        aria-label={t('dashboard.billing.copyAria', { id: inv.id })}
                        title={t('dashboard.billing.copyAria', { id: inv.id })}
                        onClick={() => void copyInvoiceId(inv.id)}
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs tabular-nums">{inv.date}</TableCell>
                  <TableCell>{inv.period}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="text-success flex items-center gap-1.5 text-xs capitalize">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{inv.method}</TableCell>
                  <TableCell className="text-right">
                    {/* WHY: the download trigger is 32px with both an accessible name and a tooltip. */}
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={t('dashboard.billing.downloadAria', { id: inv.id })}
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('dashboard.billing.downloadAria', { id: inv.id })}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
      )}
    </Page>
  )
}
