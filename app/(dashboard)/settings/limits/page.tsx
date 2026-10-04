import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { DemoDataBanner } from '@/components/blocks/DemoDataBanner'
import { UsageBar } from '@/components/blocks/UsageBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { localizedMetadata } from '@/lib/page-title'
import { SAMPLE_PLAN, SAMPLE_USAGE, usagePct, usageText } from '@/lib/usage-mock'

export function generateMetadata() {
  return localizedMetadata('/settings/limits')
}

// Same sample meters as Settings -> Billing, so both pages agree.
const quotas = SAMPLE_USAGE
// Quotas at or over the UsageBar destructive threshold get a callout.
const critical = quotas.filter((q) => usagePct(q) >= 90)

const rateLimits = [
  { endpoint: '/v1/projects', perMinute: 600, burst: 100 },
  { endpoint: '/v1/deploys', perMinute: 300, burst: 60 },
  { endpoint: '/v1/events', perMinute: 3000, burst: 500 },
  { endpoint: '/v1/customers', perMinute: 600, burst: 100 },
  { endpoint: '/v1/batch', perMinute: 10, burst: 5 },
  { endpoint: '/v1/files/upload', perMinute: 60, burst: 20 },
]

export default async function LimitsSettingsPage() {
  const t = await getTranslations()
  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading title={t('nav.items.limits')} description="Quotas and rate limits for your workspace." />
      </PageHeader>

      <PageBody className="max-w-3xl space-y-4">
        <DemoDataBanner message="Sample usage data. Connect metering to see live quotas." />

        {critical.map((q) => (
          <Card key={q.id} className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-start gap-4 p-4">
              <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">{q.label} approaching limit</p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {q.used.toLocaleString()} of {q.limit.toLocaleString()} used. Archive unused items or upgrade to raise
                  the cap.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quotas</CardTitle>
            <CardDescription>Cycle quotas reset on the 1st. Workspace totals don&apos;t reset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotas.map((q) => (
              <UsageBar
                key={q.id}
                label={q.label}
                used={q.used}
                limit={q.limit}
                valueText={usageText(q)}
                scope={q.period === 'cycle' ? 'this cycle' : 'workspace total'}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate limits</CardTitle>
            <CardDescription>
              Per-API-key limits on the {SAMPLE_PLAN.name} plan. Multiple keys multiply your effective ceiling.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {rateLimits.map((r) => (
              <div key={r.endpoint} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <p className="font-mono text-sm">{r.endpoint}</p>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">
                    {r.perMinute.toLocaleString()} <span className="text-muted-foreground font-normal">/ min</span>
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">Burst {r.burst}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Link
          href="/pricing"
          className="group focus-visible:ring-ring/50 block rounded-xl outline-none focus-visible:ring-[3px]"
        >
          <Card className="group-hover:bg-muted/40 transition-colors">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Need higher limits?</p>
                <p className="text-muted-foreground text-xs">
                  Enterprise lifts all caps and adds dedicated capacity in your region.
                </p>
              </div>
              <ChevronRight className="text-muted-foreground size-4" aria-hidden="true" />
            </CardContent>
          </Card>
        </Link>
      </PageBody>
    </Page>
  )
}
