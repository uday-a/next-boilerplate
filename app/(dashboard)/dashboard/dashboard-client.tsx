'use client'

import { useState } from 'react'
import {
  Users,
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart } from '@/components/ui/charts/line-chart'
import { BarChart } from '@/components/ui/charts/bar-chart'
import { AreaChart } from '@/components/ui/charts/area-chart'
import { FunnelChart } from '@/components/ui/charts/funnel-chart'
import { GaugeChart } from '@/components/ui/charts/gauge-chart'
import { TreemapChart } from '@/components/ui/charts/treemap-chart'
import { CalendarHeatmap } from '@/components/ui/charts/calendar-heatmap'
import { Sparkline } from '@/components/ui/charts/sparkline'
import { SectionCard } from '@/components/ui/section-card'
import { DataList, DataListItem } from '@/components/ui/data-list'
import { IconBox } from '@/components/ui/icon-box'
import { DashboardKpiTile } from '@/components/blocks/DashboardKpiTile'
import { type Range, useDashboardData } from '@/lib/use-dashboard-data'

export function DashboardClient() {
  const [range, setRange] = useState<Range>('30d')
  const {
    revenueSeries,
    requestsBlock,
    funnel,
    funnelOption,
    segments,
    segmentsVisibleCount,
    totalHeadcount,
    totalTeams,
    calendarData,
    calendarRange,
    topProducts,
    alerts,
    topCustomers,
    miniChrome,
    activities,
    totalMrr,
    totalDeploys,
    statusTone,
    formatK,
    kpi,
    rangeLabel,
  } = useDashboardData(range)

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Real-time overview of revenue, traffic, and operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList className="h-8">
              {(['24h', '7d', '30d', 'qtd', 'ytd'] as const).map((r) => (
                <TabsTrigger key={r} value={r} className="h-6 text-xs">
                  {r === 'qtd' ? 'QTD' : r === 'ytd' ? 'YTD' : r}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button size="sm" className="gap-1.5">
            <Sparkles className="size-3.5" />
            Insights
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <DashboardKpiTile
          label="MRR"
          value={`$${formatK(totalMrr)}`}
          delta={kpi.mrr.delta}
          icon={DollarSign}
          iconClassName="text-muted-foreground"
        >
          <Sparkline data={kpi.spark.revenue} height={36} className="mt-1.5" />
        </DashboardKpiTile>

        <DashboardKpiTile
          label="Active users"
          value="12,847"
          delta={kpi.users.delta}
          icon={Users}
          iconClassName="text-muted-foreground"
        >
          <BarChart
            data={kpi.spark.users.map((v, i) => ({ x: i, y: v }))}
            height={36}
            option={miniChrome}
            className="mt-1.5"
          />
        </DashboardKpiTile>

        <DashboardKpiTile
          label="Requests / min"
          value="2,484"
          delta={kpi.rpm.delta}
          icon={Zap}
          iconClassName="text-muted-foreground"
        >
          <AreaChart
            data={kpi.spark.requests.map((v, i) => ({ x: i, y: v }))}
            height={36}
            option={miniChrome}
            className="mt-1.5"
          />
        </DashboardKpiTile>

        <DashboardKpiTile
          label="Conversion"
          value="7.4%"
          delta={kpi.conversion.delta}
          icon={TrendingUp}
          iconClassName="text-muted-foreground"
        >
          <BarChart
            data={kpi.spark.conversion.map((v, i) => ({ x: i, y: v }))}
            height={36}
            option={miniChrome}
            className="mt-1.5"
          />
        </DashboardKpiTile>

        <DashboardKpiTile
          label="Avg latency"
          value="412ms"
          delta={kpi.latency.delta}
          deltaTone="negative"
          icon={Zap}
          iconClassName="text-muted-foreground"
        >
          <AreaChart
            data={kpi.spark.latency.map((v, i) => ({ x: i, y: v }))}
            height={36}
            option={miniChrome}
            className="mt-1.5"
          />
        </DashboardKpiTile>

        <DashboardKpiTile
          label="Churn"
          value="1.8%"
          delta={kpi.churn.delta}
          icon={TrendingDown}
          iconClassName="text-muted-foreground"
        >
          <div className="space-y-1 pt-2">
            <Progress value={98.2} className="h-1.5" />
            <div className="flex justify-between text-[9px] text-muted-foreground tabular-nums">
              <span>Retained 98.2%</span>
              <span>Target 99%</span>
            </div>
          </div>
        </DashboardKpiTile>
      </div>

      <div className="grid gap-3 lg:grid-cols-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm">Revenue vs expenses</CardTitle>
              <CardDescription className="text-xs">
                {rangeLabel} · in USD
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              MRR {kpi.mrr.delta}
            </Badge>
          </CardHeader>
          <CardContent className="pb-3">
            <LineChart data={revenueSeries} xField="x" yField={['revenue', 'expenses']} height={300} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversion funnel</CardTitle>
            <CardDescription className="text-xs">
              {rangeLabel} · 1.8% end-to-end (60% → 40% → 30% → 25%)
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <FunnelChart data={funnel} height={300} option={funnelOption} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quota</CardTitle>
            <CardDescription className="text-xs">API · monthly</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <GaugeChart value={68} unit="%" height={300} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{requestsBlock.title}</CardTitle>
            <CardDescription className="text-xs">{requestsBlock.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <BarChart data={requestsBlock.data} xField="x" yField="y" height={200} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Headcount by team</CardTitle>
            <CardDescription className="text-xs">
              {totalHeadcount} people across {totalTeams} teams · top {segmentsVisibleCount} shown
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <TreemapChart data={segments} height={200} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm">Active alerts</CardTitle>
              <CardDescription className="text-xs">3 open · 12 resolved today</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
              All
              <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5 pb-3">
            {alerts.map((a, i) => {
              const Icon = a.icon
              return (
                <div key={i} className="flex items-start gap-2.5 border-l-2 border-muted pl-2.5">
                  <Icon className={['mt-0.5 size-3.5 shrink-0', a.tone].join(' ')} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-[13px] font-medium">{a.title}</p>
                    <p className="text-muted-foreground line-clamp-1 text-[11px]">{a.detail}</p>
                    <p className="text-muted-foreground/70 text-[10px]">{a.age}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm">Deploy activity · last 365 days</CardTitle>
            <CardDescription className="text-xs">
              {totalDeploys.toLocaleString()} deploys · longest streak 18 days
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              <span className="size-2.5 rounded-sm bg-muted" />
              <span className="size-2.5 rounded-sm bg-amber-200" />
              <span className="size-2.5 rounded-sm bg-amber-400" />
              <span className="size-2.5 rounded-sm bg-amber-600" />
              <span className="size-2.5 rounded-sm bg-amber-800" />
            </div>
            <span>More</span>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <CalendarHeatmap data={calendarData} range={calendarRange} height={160} />
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top products by MRR</CardTitle>
            <CardDescription className="text-xs">
              5 products · ${formatK(totalMrr)} total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-3">
            {topProducts.map((p) => (
              <div key={p.name} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13px] font-medium">{p.name}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[13px] tabular-nums">${formatK(p.mrr)}</span>
                    <span
                      className={[
                        'text-[10px] font-medium',
                        p.up ? 'text-emerald-600' : 'text-rose-600',
                      ].join(' ')}
                    >
                      {p.up ? (
                        <ArrowUpRight className="inline size-3" />
                      ) : (
                        <ArrowDownRight className="inline size-3" />
                      )}
                      {p.change}
                    </span>
                  </div>
                </div>
                <Progress value={(p.mrr / totalMrr) * 100} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top customers</CardTitle>
            <CardDescription className="text-xs">By MRR · 6 of 142 accounts</CardDescription>
          </CardHeader>
          <CardContent className="divide-y pb-1">
            {topCustomers.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {c.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{c.name}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {c.plan} ·{' '}
                    <span className={['inline-block size-1.5 rounded-full', statusTone[c.status]].join(' ')} />{' '}
                    {c.status}
                  </p>
                </div>
                <span className="text-[12px] tabular-nums whitespace-nowrap">${formatK(c.mrr)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <SectionCard
          title="Recent activity"
          description="Live feed across products"
          className="lg:col-span-2"
        >
          <DataList>
            {activities.map((item, i) => {
              const Icon = item.icon
              return (
                <DataListItem key={i}>
                  <div className="flex items-center gap-2.5">
                    <IconBox icon={Icon} variant="muted" iconClassName={item.iconClass} />
                    <div>
                      <p className="text-[13px] font-medium">{item.title}</p>
                      <p className="text-muted-foreground text-[11px]">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground ml-3 text-[11px] whitespace-nowrap">{item.age}</span>
                </DataListItem>
              )
            })}
          </DataList>
        </SectionCard>
      </div>
    </div>
  )
}