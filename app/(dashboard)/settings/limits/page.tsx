'use client'

import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const quotas = [
  { name: 'Genesis API calls', used: 248_120, limit: 600_000, period: 'this month', risk: 'low' },
  { name: 'Explorer API calls', used: 71_300, limit: 200_000, period: 'this month', risk: 'low' },
  { name: 'Quantum API calls', used: 1_840_000, limit: 3_000_000, period: 'this month', risk: 'medium' },
  { name: 'Batch endpoint requests', used: 2_140, limit: 5_000, period: 'this month', risk: 'low' },
  { name: 'File bundles (active)', used: 47, limit: 50, period: 'workspace total', risk: 'high' },
  { name: 'Compute hours', used: 127.4, limit: 250, period: 'this month', risk: 'medium' },
  { name: 'Storage', used: 38.2, limit: 100, period: 'workspace total', risk: 'low' },
  { name: 'Team seats', used: 8, limit: 25, period: 'workspace total', risk: 'low' },
]

const rateLimits = [
  { endpoint: '/complete', tier: 'Pro', perMinute: 600, burst: 100 },
  { endpoint: '/complete/stream', tier: 'Pro', perMinute: 600, burst: 100 },
  { endpoint: '/complete (Explorer)', tier: 'Pro', perMinute: 200, burst: 50 },
  { endpoint: '/complete (Quantum)', tier: 'Pro', perMinute: 3000, burst: 500 },
  { endpoint: '/batch', tier: 'Pro', perMinute: 10, burst: 5 },
  { endpoint: '/files/upload', tier: 'Pro', perMinute: 60, burst: 20 },
]

const riskClass: Record<string, string> = {
  low: 'bg-primary',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
}

function pct(used: number, limit: number) {
  return Math.min(100, Math.round((used / limit) * 100))
}

function fmt(n: number) {
  return n >= 1000 ? n.toLocaleString() : String(n)
}

export default function LimitsSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Limits</h1>
        <p className="text-muted-foreground text-sm">
          Quotas and rate limits for your workspace. Anything in red needs attention.
        </p>
      </header>

      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-500" />
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
        <CardContent className="space-y-5">
          {quotas.map((quota) => (
            <div key={quota.name} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{quota.name}</span>
                  <span className="text-muted-foreground text-xs">{quota.period}</span>
                </div>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {fmt(quota.used)} / {fmt(quota.limit)}{' '}
                  <span className="text-foreground font-medium">({pct(quota.used, quota.limit)}%)</span>
                </span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${riskClass[quota.risk]}`}
                  style={{ width: `${pct(quota.used, quota.limit)}%` }}
                />
              </div>
            </div>
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

      <Card className="hover:bg-muted/40 cursor-pointer transition-colors">
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
    </div>
  )
}