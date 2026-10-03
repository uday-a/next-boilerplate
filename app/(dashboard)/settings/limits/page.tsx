'use client'

import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { UsageBar } from '@/components/blocks/UsageBar'

const quotas = [
  { name: 'Genesis API calls', used: 248_120, limit: 600_000, period: 'this month' },
  { name: 'Explorer API calls', used: 71_300, limit: 200_000, period: 'this month' },
  { name: 'Quantum API calls', used: 1_840_000, limit: 3_000_000, period: 'this month' },
  { name: 'Batch endpoint requests', used: 2_140, limit: 5_000, period: 'this month' },
  { name: 'File bundles (active)', used: 47, limit: 50, period: 'workspace total' },
  { name: 'Compute hours', used: 127.4, limit: 250, period: 'this month' },
  { name: 'Storage', used: 38.2, limit: 100, period: 'workspace total' },
  { name: 'Team seats', used: 8, limit: 25, period: 'workspace total' },
]

const rateLimits = [
  { endpoint: '/complete', tier: 'Pro', perMinute: 600, burst: 100 },
  { endpoint: '/complete/stream', tier: 'Pro', perMinute: 600, burst: 100 },
  { endpoint: '/complete (Explorer)', tier: 'Pro', perMinute: 200, burst: 50 },
  { endpoint: '/complete (Quantum)', tier: 'Pro', perMinute: 3000, burst: 500 },
  { endpoint: '/batch', tier: 'Pro', perMinute: 10, burst: 5 },
  { endpoint: '/files/upload', tier: 'Pro', perMinute: 60, burst: 20 },
]

function fmt(n: number) {
  return n >= 1000 ? n.toLocaleString() : String(n)
}

export default function LimitsSettingsPage() {
  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title="Limits"
          description="Quotas and rate limits for your workspace. Anything at 90% or more needs attention."
        />
      </PageHeader>
      <PageBody className="space-y-4">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold">File bundles approaching limit</p>
              <p className="text-muted-foreground text-xs">
                47 of 50 active bundles. Archive unused bundles or upgrade to remove the cap.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage bundles
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quotas</CardTitle>
            <CardDescription>Monthly quotas reset on the 1st. Workspace-total quotas don&apos;t reset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotas.map((quota) => (
              <UsageBar
                key={quota.name}
                label={quota.name}
                used={quota.used}
                limit={quota.limit}
                valueText={`${fmt(quota.used)} / ${fmt(quota.limit)}`}
                scope={quota.period}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate limits</CardTitle>
            <CardDescription>Per-API-key limits. Multiple keys multiply your effective ceiling.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {rateLimits.map((limit) => (
              <div key={limit.endpoint} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="font-mono text-sm">{limit.endpoint}</p>
                  <p className="text-muted-foreground text-xs">{limit.tier} tier</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">
                    {limit.perMinute.toLocaleString()}{' '}
                    <span className="text-muted-foreground font-normal">/ min</span>
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">Burst: {limit.burst}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Link href="/settings/billing" className="block">
          <Card className="hover:bg-muted/40 transition-colors">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold">Need higher limits?</p>
                <p className="text-muted-foreground text-xs">
                  Enterprise tier lifts all caps and adds dedicated capacity in your region.
                </p>
              </div>
              <ChevronRight className="text-muted-foreground size-4" />
            </CardContent>
          </Card>
        </Link>
      </PageBody>
    </Page>
  )
}