'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { DateRange } from 'react-day-picker'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar as CalendarIcon,
  CheckCircle2,
  DollarSign,
  MapPin,
  RotateCcw,
  Sparkles,
  Table2,
  Timer,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { RawChart } from '@/components/ui/charts/raw-chart'
import { useChartTheme } from '@/components/ui/charts/useChartTheme'
import { BarChart } from '@/components/ui/charts/bar-chart'
import { FunnelChart } from '@/components/ui/charts/funnel-chart'
import { TreemapChart } from '@/components/ui/charts/treemap-chart'
import { CalendarHeatmap } from '@/components/ui/charts/calendar-heatmap'
import { Sparkline } from '@/components/ui/charts/sparkline'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionCard } from '@/components/ui/section-card'
import { DataList, DataListItem } from '@/components/ui/data-list'
import { IconBox } from '@/components/ui/icon-box'
import { StatTile } from '@/components/blocks/StatTile'
import { MapControls } from '@/components/blocks/MapControls'
import { OfficePopup } from '@/components/blocks/OfficePopup'
import { LeafletCircleMarker, LeafletMap, LeafletMarker, LeafletPopup, LeafletTooltip, type LeafletMapRef } from '@/components/ui/leaflet-map'
import { customerRadius, customerRegions, kindDotBg, kindDotClass, markerSizeClass, officeLocations } from '@/lib/locations'
import { formatPct } from '@/lib/funnel'
import { formatK, statusTone, useDashboardData, type Range } from '@/lib/use-dashboard-data'

const shareColors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']

// "35k" instead of "35,000" -- frees width for the bars.
const compactValueAxis = {
  yAxis: { splitNumber: 4, axisLabel: { formatter: (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v)) } },
}

const severityClass = {
  critical: { node: 'bg-destructive/10 text-destructive', badge: 'bg-destructive/10 text-destructive', label: 'Critical' },
  warning: { node: 'bg-warning/10 text-warning', badge: 'bg-warning/10 text-warning', label: 'Warning' },
  info: { node: 'bg-info/10 text-info', badge: 'bg-info/10 text-info', label: 'Info' },
} as const

// Region map: offices span SF -> Sydney, so fitBounds snaps down to zoom 1
// on this wide, short card (the world repeats). Zoom 2 shows it once,
// centred on the band where the offices sit. Whole zoom = no tile seams.
const REGION_VIEW = { center: [20, 14] as [number, number], zoom: 2 }

export function DashboardClient() {
  const t = useTranslations()
  const regionMap = useRef<LeafletMapRef>(null)
  function fitRegionMap(animate = false) {
    if (animate) regionMap.current?.flyTo({ ...REGION_VIEW, duration: 600 })
    else regionMap.current?.setView(REGION_VIEW)
  }
  const locale = useLocale()
  const [range, setRange] = useState<Range>('30d')

  // Custom range via a RangeCalendar-in-Popover. Picking both endpoints
  // flips the dashboard into the 'custom' range so the same range-aware
  // computeds (kpi, revenueSeries, funnel, ...) respond; picking a preset
  // tab clears the calendar value.
  const [customCal, setCustomCal] = useState<DateRange | undefined>(undefined)
  const [customOpen, setCustomOpen] = useState(false)

  const customStartEnd = useMemo(() => {
    const s = customCal?.from
    const e = customCal?.to
    if (!s || !e) return null
    return { start: s, end: e }
  }, [customCal])

  const customSpan = useMemo(() => {
    if (!customStartEnd) return null
    // WHY: the label carries the year so "Sep 5 – Sep 12" is never
    // ambiguous across year boundaries.
    const df = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    return t('dashboard.range.customLabel', {
      start: df.format(customStartEnd.start),
      end: df.format(customStartEnd.end),
    })
  }, [customStartEnd, locale, t])

  const {
    revenueComboOption, revenueSeries, requestsBlock, funnel, funnelSummary, funnelOption, segments,
    totalHeadcount, totalDepartments, calendarData, calendarRange, calendarColorRange,
    calendarOption, gaugeOption, quotaMeta,
    topProducts, alerts, topCustomers, activities, totalMrr,
    totalDeploys, asOfLabel, rangeLabel, kpi,
  } = useDashboardData(range, locale)

  const theme = useChartTheme()
  // Chart-1 blue for the bar/line minis (area minis keep the default teal).
  const chartBlue = theme.colors[0] ?? '#2563eb'

  // Range totals for the revenue card footer -- balances the funnel card's
  // step-rates footer so the row stays even.
  const revenueTotals = useMemo(() => {
    const revenue = revenueSeries.reduce((t, p) => t + p.revenue, 0)
    const expenses = revenueSeries.reduce((t, p) => t + p.expenses, 0)
    return { revenue, expenses, net: revenue - expenses }
  }, [revenueSeries])

  // Subtitle label: picked dates when a custom range is active,
  // otherwise the preset label from the data hook.
  const displayLabel = range === 'custom' && customSpan ? customSpan : rangeLabel

  function handleCustomSelect(v: DateRange | undefined) {
    setCustomCal(v)
    if (v?.from && v?.to) {
      setRange('custom')
      setCustomOpen(false)
    }
  }

  function handleRangeChange(v: string) {
    // Picking a preset tab clears the calendar value.
    if (v !== 'custom') setCustomCal(undefined)
    setRange(v as Range)
  }

  // NOTE: Nuxt wires this icon-button to `replayTour` ("Take the tour").
  // There is no Tour primitive in this repo, so the tour dialog + "Take
  // the tour" button + "Don't show again" checkbox are intentionally
  // omitted. The button keeps its Nuxt slot as a range reset instead.
  function handleReset() {
    setCustomCal(undefined)
    setRange('30d')
  }

  return (
    <Page>
      <PageHeader
        actions={(
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Tabs value={range} onValueChange={handleRangeChange} className="w-auto">
              <TabsList className="h-9 w-auto">
                <TabsTrigger value="24h" className="text-xs px-2.5">
                  24h
                </TabsTrigger>
                <TabsTrigger value="7d" className="text-xs px-2.5">
                  7d
                </TabsTrigger>
                <TabsTrigger value="30d" className="text-xs px-2.5">
                  30d
                </TabsTrigger>
                <TabsTrigger value="qtd" className="text-xs px-2.5">
                  QTD
                </TabsTrigger>
                <TabsTrigger value="ytd" className="text-xs px-2.5">
                  YTD
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Popover open={customOpen} onOpenChange={setCustomOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={range === 'custom' ? 'secondary' : 'outline'}
                  size="sm"
                  className="gap-1.5 h-9"
                >
                  <CalendarIcon className="size-4" aria-hidden="true" />
                  {range === 'custom' && customSpan ? customSpan : t('dashboard.range.custom')}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <RangeCalendar selected={customCal} onSelect={handleCustomSelect} />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" className="gap-1.5 h-9">
              <Sparkles className="size-4" aria-hidden="true" />
              Insights
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-9"
              title="Reset range"
              aria-label="Reset range"
              onClick={handleReset}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      >
        <PageHeaderHeading
          title={t('nav.items.dashboard')}
          description="Real-time overview of revenue, traffic, and operations."
        />
      </PageHeader>
      <PageBody className="@container space-y-4">
        {/* WHY: visible freshness stamp. The demo anchor is fixed
            (see useDashboardData asOfLabel) so SSR + client agree. */}
        <p className="text-muted-foreground text-xs">
          {t('dashboard.asOf', { date: asOfLabel })}
        </p>
        {/* KPI strip: 5 tiles, each with a trend-only Sparkline.
            Minis are shape, not scale -- Sparkline is zero-based. */}
        <div data-tour="kpis" className="grid grid-cols-2 gap-3 sm:gap-4 @2xl:grid-cols-3 @5xl:grid-cols-5">
          <StatTile
            label="MRR"
            value={`$${formatK(totalMrr)}`}
            delta={kpi.mrr.delta}
            icon={DollarSign}
            definition={t('dashboard.kpiDefs.mrr')}
          >
            <Sparkline data={kpi.spark.revenue} height={36} className="mt-2" ariaLabel="MRR trend sparkline" />
          </StatTile>

          <StatTile
            label="Active users"
            value="12,847"
            delta={kpi.users.delta}
            icon={Users}
            definition={t('dashboard.kpiDefs.users')}
          >
            <Sparkline
              data={kpi.spark.users}
              height={36}
              variant="bars"
              color={chartBlue}
              className="mt-2"
              ariaLabel="Active users trend bar chart"
            />
          </StatTile>

          <StatTile
            label="Requests / min"
            value="2,484"
            delta={kpi.rpm.delta}
            icon={Zap}
            definition={t('dashboard.kpiDefs.rpm')}
          >
            <Sparkline
              data={kpi.spark.requests}
              height={36}
              variant="line"
              color={chartBlue}
              className="mt-2"
              ariaLabel="Requests per minute trend line"
            />
          </StatTile>

          {/* Avg latency: rising is bad, so delta tone is negative. */}
          <StatTile
            label="Avg latency"
            value="412ms"
            delta={kpi.latency.delta}
            deltaTone="negative"
            icon={Timer}
            definition={t('dashboard.kpiDefs.latency')}
          >
            <Sparkline
              data={kpi.spark.latency}
              height={36}
              variant="dots"
              className="mt-2"
              ariaLabel="Average latency trend line with sampled points"
            />
          </StatTile>

          {/* Churn: down is good, so delta stays positive even though it's
              a negative number. */}
          <StatTile
            className="col-span-2 @5xl:col-span-1"
            label="Churn"
            value="1.8%"
            delta={kpi.churn.delta}
            icon={TrendingDown}
            definition={t('dashboard.kpiDefs.churn')}
          >
            <div className="space-y-1.5 pt-2">
              <Progress value={98.2} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>Retained 98.2%</span>
                <span>Target 99%</span>
              </div>
            </div>
          </StatTile>
        </div>

        {/* Charts row 1: revenue combo + funnel + alerts (critical items above the fold) */}
        <div data-tour="charts" className="grid gap-4 @4xl:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">
                  Revenue vs expenses
                </CardTitle>
                <CardDescription>
                  {displayLabel} · in USD
                </CardDescription>
              </div>
              <Badge variant="outline">
                MRR {kpi.mrr.delta}
              </Badge>
            </CardHeader>
            <CardContent>
              <RawChart option={revenueComboOption} height={300} ariaLabel="Revenue versus expenses chart" />
            </CardContent>
            <CardFooter className="mt-auto">
              <dl className="grid w-full grid-cols-3 gap-2 border-t pt-3 text-center">
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Revenue
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    ${formatK(revenueTotals.revenue)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Expenses
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    ${formatK(revenueTotals.expenses)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Net
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    ${formatK(revenueTotals.net)}
                  </dd>
                </div>
              </dl>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Conversion funnel
              </CardTitle>
              <CardDescription>
                {displayLabel} · {formatPct(funnelSummary.endToEnd)} end-to-end
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelChart data={funnel} height={300} option={funnelOption} />
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">
                  Quota
                </CardTitle>
                <CardDescription>
                  API · monthly
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" tabIndex={0} className="text-muted-foreground px-1.5">
                      <CalendarIcon aria-hidden="true" />
                      <span className="sr-only">{t('dashboard.range.staticNote')}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {t('dashboard.range.staticNote')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <RawChart option={gaugeOption} height={220} ariaLabel="API quota gauge" />
              <dl className="grid grid-cols-3 gap-2 border-t pt-4 text-center">
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Used
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    {formatK(quotaMeta.used)}<span className="text-muted-foreground block text-xs font-normal">{t('dashboard.quota.unit')}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Left
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    {formatK(quotaMeta.remaining)}<span className="text-muted-foreground block text-xs font-normal">{t('dashboard.quota.unit')}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Resets
                  </dt>
                  <dd className="text-sm font-medium tabular-nums">
                    {quotaMeta.renews}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground w-full gap-1 text-xs">
                <Link href="/settings/billing">
                  Need more quota? View plans
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Charts row 2: bar chart + treemap + alerts list */}
        <div className="grid gap-4 @4xl:grid-cols-3">
          {/* Chart cards stretch to the row (the alerts timeline sets its
              height), so the charts fill the card instead of a fixed 200px. */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {requestsBlock.title}
              </CardTitle>
              <CardDescription>
                {requestsBlock.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex-1">
              <BarChart
                data={requestsBlock.data}
                xField="x"
                yField="y"
                height="100%"
                unit="requests"
                option={compactValueAxis}
                ariaLabel={requestsBlock.title}
              />
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">
                  Headcount by department
                </CardTitle>
                <CardDescription>
                  {totalHeadcount.toLocaleString(locale)} people across {totalDepartments} departments
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" tabIndex={0} className="text-muted-foreground px-1.5">
                      <CalendarIcon aria-hidden="true" />
                      <span className="sr-only">{t('dashboard.range.staticNote')}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {t('dashboard.range.staticNote')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="min-h-[200px] flex-1">
              <TreemapChart data={segments} height="100%" ariaLabel="Headcount by department treemap" />
            </CardContent>
          </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">
                Active alerts
              </CardTitle>
              <CardDescription>
                5 open · 12 resolved today
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-8">
              All
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="pb-4">
            {/* Timeline: one continuous rail, a severity node per alert. */}
            {/* WHY: trivial failed-state branch -- an empty alert
                list renders an EmptyState instead of a blank card. */}
            {alerts.length > 0 ? (
            <ol>
              {alerts.map((a, i) => {
                const Icon = a.icon
                return (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < alerts.length - 1 ? (
                      <span
                        className="bg-border absolute top-8 bottom-0 left-4 w-px -translate-x-1/2"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className={`ring-card relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ${severityClass[a.severity].node}`}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="truncate text-sm font-medium" title={a.title}>
                        {a.title}
                      </div>
                      <div className="text-muted-foreground line-clamp-1 text-xs">
                        {a.detail}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${severityClass[a.severity].badge}`}>
                          {severityClass[a.severity].label}
                        </span>
                        <span className="text-muted-foreground min-w-0 truncate text-xs">{a.source}</span>
                        <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">{a.age}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
            ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No open alerts"
              description="New alerts will appear here."
            />
            )}
          </CardContent>
        </Card>
        </div>

        {/* Customers by region: muted world map embedded in a scrollable page,
            so wheel zoom stays off and the wheel scrolls the page. */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t('dashboard.locations.widgetTitle')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.locations.widgetDescription')}
            </CardDescription>
            <CardAction>
              <Badge variant="outline" className="tabular-nums">
                <Building2 aria-hidden="true" />
                {t('dashboard.locations.officeCount', { n: officeLocations.length })}
              </Badge>
            </CardAction>
          </CardHeader>
          {/* Map fills the card edge to edge (no inner frame), like locations. */}
          <CardContent className="p-0">
            <div className="relative isolate">
              <LeafletMap
                ref={regionMap}
                variant="muted"
                center={[-20, 20]}
                zoom={2}
                minZoom={1}
                scrollWheelZoom={false}
                navigation={false}
                className="h-[360px] w-full overflow-hidden"
                onCreated={() => fitRegionMap()}
              >
                {customerRegions.map((c) => (
                  <LeafletCircleMarker
                    key={c.id}
                    center={c.lngLat}
                    radius={customerRadius(c.arr) * 0.8}
                    color={theme.colors[1]}
                    fillColor={theme.colors[1]}
                    fillOpacity={0.25}
                    weight={1.5}
                  >
                    <LeafletTooltip direction="top">
                      <span className="text-xs"><span className="font-medium">{c.city}</span> · {t('dashboard.locations.accounts', { n: c.accounts })}</span>
                    </LeafletTooltip>
                  </LeafletCircleMarker>
                ))}
                {officeLocations.map((office, i) => (
                  <LeafletMarker key={office.id} lngLat={office.lngLat} anchor="center">
                    {/* WHY (Rule90): 200ms marker pop-in, and the HQ pulse is
                        gated with motion-safe so reduced-motion gets a static dot. */}
                    <span
                      className="animate-in fade-in-0 zoom-in-50 fill-mode-both relative flex items-center justify-center duration-200"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      {office.kind === 'hq' && (
                        <span className={`absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping ${kindDotBg(office.kind)}`} aria-hidden="true" />
                      )}
                      <span className={`outline-background relative block rounded-full ring-4 outline-2 transition-transform duration-200 hover:scale-125 ${markerSizeClass(office.headcount)} ${kindDotClass(office.kind)}`} />
                    </span>
                    <LeafletPopup offset={[0, -10]} minWidth={240}>
                      <OfficePopup office={office} />
                    </LeafletPopup>
                  </LeafletMarker>
                ))}
              </LeafletMap>
              <MapControls
                onZoomIn={() => regionMap.current?.zoomIn()}
                onZoomOut={() => regionMap.current?.zoomOut()}
                onReset={() => {
                  regionMap.current?.getMap()?.closePopup()
                  fitRegionMap(true)
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground gap-1.5 text-xs"
            >
              <Link href="/dashboard/locations">
                <MapPin className="size-3.5" aria-hidden="true" />
                {t('dashboard.locations.viewAll')}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Calendar heatmap (full width, dense) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">
                Deploy activity · last 365 days
              </CardTitle>
              <CardDescription>
                {totalDeploys.toLocaleString(locale)} deploys · longest streak 18 days · {t('dashboard.heatmap.asOf', { date: asOfLabel })}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-muted-foreground font-normal">
                {t('dashboard.range.staticNote')}
              </Badge>
              <span>Less</span>
              <div className="flex gap-0.5">
                <span className="bg-chart-1/10 size-2.5 rounded-sm" />
                <span className="bg-chart-1/35 size-2.5 rounded-sm" />
                <span className="bg-chart-1/65 size-2.5 rounded-sm" />
                <span className="bg-chart-1 size-2.5 rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarHeatmap
              data={calendarData}
              range={calendarRange}
              colorRange={calendarColorRange}
              option={calendarOption}
              height={160}
              ariaLabel="Deploy activity heatmap for the last 365 days"
            />
          </CardContent>
        </Card>

        {/* Bottom row: top products + customer list + recent activity */}
        <div className="grid gap-4 @4xl:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Top products by MRR
              </CardTitle>
              <CardDescription>
                5 products · ${formatK(totalMrr)} total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm" title={p.name}>{p.name}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-semibold tabular-nums">${formatK(p.mrr)}</span>
                      <span className={`text-xs font-medium ${p.up ? 'text-success' : 'text-destructive'}`}>
                        {p.up ? (
                          <ArrowUpRight className="inline size-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowDownRight className="inline size-3.5" aria-hidden="true" />
                        )}
                        {p.change}
                      </span>
                    </div>
                  </div>
                  <Progress value={(p.mrr / totalMrr) * 100} className="h-1.5" />
                </div>
              ))}
              {/* Share of MRR: one stacked bar, same order and colours as the list. */}
              <div className="space-y-2 border-t pt-3">
                <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Share of MRR
                </div>
                <div className="flex h-2 overflow-hidden rounded-full">
                  {topProducts.map((p, i) => (
                    <div
                      key={p.name}
                      className={`h-full ${shareColors[i % shareColors.length]}`}
                      style={{ width: `${(p.mrr / totalMrr) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {topProducts.map((p, i) => (
                    <span key={p.name} className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${shareColors[i % shareColors.length]}`} />
                      {p.name} <span className="tabular-nums">{Math.round((p.mrr / totalMrr) * 100)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground w-full gap-1 text-xs"
              >
                <Link href="/settings/billing">
                  View plans
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Top customers
              </CardTitle>
              <CardDescription>
                By MRR · 6 of 142 accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {topCustomers.map((c) => (
                <div key={c.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                      {c.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={c.name}>
                      {c.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {c.plan} · <span className={`inline-block size-1.5 rounded-full ${statusTone[c.status]}`} /> {c.status}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums whitespace-nowrap">${formatK(c.mrr)}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground w-full gap-1 text-xs"
              >
                <Link href="/dashboard/data-table">
                  View all customers
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <SectionCard
            title="Recent activity"
            description="Live feed across products"
          >
            <DataList>
              {activities.slice(0, 5).map((item, i) => {
                const Icon = item.icon
                return (
                  <DataListItem key={i}>
                    <div className="flex items-center gap-3">
                      <IconBox icon={Icon} variant="muted" iconClassName={item.iconClass} />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-muted-foreground text-xs">{item.detail}</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground ml-3 text-xs whitespace-nowrap">{item.age}</span>
                  </DataListItem>
                )
              })}
            </DataList>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground mt-auto w-full gap-1 text-xs"
            >
              <Link href="/settings/activity">
                View all activity
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </SectionCard>
        </div>

        {/* Full data-table entry point (also a tour target). */}
        <div data-tour="table-link" className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground gap-1.5 text-xs"
          >
            <Link href="/dashboard/data-table">
              <Table2 className="size-3.5" aria-hidden="true" />
              {t('dashboard.tableLink.label')}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </PageBody>
    </Page>
  )
}
