'use client'

import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  GitBranch,
  Info,
  MessageSquare,
  ShieldAlert,
  UserPlus,
} from 'lucide-react'
import { useChartTheme } from '@/components/ui/charts/useChartTheme'
import { computeFunnelStats, describeFunnelForAria, normalizeFunnelStages } from '@/lib/funnel'

export type Range = '24h' | '7d' | '30d' | 'qtd' | 'ytd' | 'custom'

// Human label per range. Powers the funnel + hourly-requests subtitles
// so the descriptive copy stays in sync with the selected tab.
const RANGE_LABEL: Record<Range, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  qtd: 'Quarter to date',
  ytd: 'Year to date',
  custom: 'Custom range',
}

// Deterministic spark generator -- no Math.random() so SSR + client
// produce identical arrays. The smooth (start -> end) ramp + a small
// sinusoidal noise term reads as a trend on a 36px-tall sparkline
// without any seed library.
function spark(len: number, start: number, end: number, jitter: number, seed: number): number[] {
  return Array.from({ length: len }, (_, i) => {
    const t = len <= 1 ? 1 : i / (len - 1)
    const base = start + (end - start) * t
    const noise = Math.sin((i + seed) * 9.3) * jitter
    return Math.round((base + noise) * 100) / 100
  })
}

interface KpiBlock {
  mrr: { delta: string }
  users: { delta: string }
  rpm: { delta: string }
  conversion: { delta: string }
  latency: { delta: string }
  churn: { delta: string }
  spark: {
    revenue: number[]
    users: number[]
    requests: number[]
    conversion: number[]
    latency: number[]
  }
}

// Per-range deltas + spark trends. Headline values (MRR, current
// users, current latency, etc.) stay constant across ranges -- they
// are point-in-time snapshots. The DELTA and the spark are what the
// selected window actually changes, matching how real dashboards work.
const KPI_BY_RANGE: Record<Range, KpiBlock> = {
  '24h': {
    mrr: { delta: '+0.4%' },
    users: { delta: '+1.1%' },
    rpm: { delta: '+1.2%' },
    conversion: { delta: '+0.1pp' },
    latency: { delta: '+3ms' },
    churn: { delta: '-0.05pp' },
    spark: {
      revenue: spark(24, 4500, 4720, 60, 11),
      users: spark(24, 12500, 12847, 80, 7),
      requests: spark(24, 2300, 2484, 90, 3),
      conversion: spark(24, 7.2, 7.4, 0.1, 5),
      latency: spark(24, 408, 412, 4, 13),
    },
  },
  '7d': {
    mrr: { delta: '+2.8%' },
    users: { delta: '+3.4%' },
    rpm: { delta: '+4.2%' },
    conversion: { delta: '+0.3pp' },
    latency: { delta: '+9ms' },
    churn: { delta: '-0.1pp' },
    spark: {
      revenue: [4380, 4420, 4510, 4570, 4620, 4680, 4720],
      users: [11800, 12000, 12200, 12350, 12500, 12700, 12847],
      requests: [2100, 2180, 2240, 2300, 2360, 2420, 2484],
      conversion: [7.0, 7.1, 7.2, 7.25, 7.3, 7.35, 7.4],
      latency: [403, 406, 405, 408, 410, 411, 412],
    },
  },
  '30d': {
    mrr: { delta: '+12.4%' },
    users: { delta: '+8.1%' },
    rpm: { delta: '+12.0%' },
    conversion: { delta: '+0.6pp' },
    latency: { delta: '+18ms' },
    churn: { delta: '-0.3pp' },
    spark: {
      revenue: spark(30, 4180, 4720, 80, 17),
      users: spark(30, 11500, 12847, 120, 23),
      requests: spark(30, 2150, 2484, 110, 29),
      conversion: spark(30, 6.8, 7.4, 0.15, 31),
      latency: spark(30, 395, 412, 5, 37),
    },
  },
  qtd: {
    mrr: { delta: '+24.1%' },
    users: { delta: '+18.3%' },
    rpm: { delta: '+18.8%' },
    conversion: { delta: '+1.2pp' },
    latency: { delta: '+24ms' },
    churn: { delta: '-0.6pp' },
    spark: {
      revenue: spark(12, 3760, 4720, 120, 41),
      users: spark(12, 10800, 12847, 200, 43),
      requests: spark(12, 1980, 2484, 140, 47),
      conversion: spark(12, 6.2, 7.4, 0.2, 53),
      latency: spark(12, 388, 412, 7, 59),
    },
  },
  ytd: {
    mrr: { delta: '+58.6%' },
    users: { delta: '+42.5%' },
    rpm: { delta: '+28.4%' },
    conversion: { delta: '+2.1pp' },
    latency: { delta: '+47ms' },
    churn: { delta: '-1.1pp' },
    // Jan -> Sep 2026, one point per month.
    spark: {
      revenue: [2980, 3180, 3390, 3620, 3850, 4080, 4300, 4510, 4720],
      users: [9000, 9450, 9900, 10380, 10850, 11350, 11850, 12350, 12847],
      requests: [1880, 1960, 2040, 2110, 2190, 2260, 2340, 2410, 2484],
      conversion: [5.3, 5.6, 5.8, 6.1, 6.4, 6.7, 6.9, 7.2, 7.4],
      latency: [365, 371, 377, 383, 389, 395, 401, 406, 412],
    },
  },
  // Custom range (RangeCalendar popover): the picked {start,end} window
  // drives which tab is active; the series below are a plausible
  // mid-length window so every range-aware computed keeps working.
  custom: {
    mrr: { delta: '+9.6%' },
    users: { delta: '+6.2%' },
    rpm: { delta: '+8.4%' },
    conversion: { delta: '+0.4pp' },
    latency: { delta: '+12ms' },
    churn: { delta: '-0.2pp' },
    spark: {
      revenue: spark(14, 4280, 4720, 70, 71),
      users: spark(14, 11800, 12847, 110, 73),
      requests: spark(14, 2200, 2484, 100, 79),
      conversion: spark(14, 7.0, 7.4, 0.12, 83),
      latency: spark(14, 400, 412, 5, 89),
    },
  },
}

// -- Per-range chart data -------------------------------------------
//
// Revenue / Requests / Funnel / Top products vary with the selected
// range. The static panels (treemap, calendar, alerts, customers,
// activities, quota gauge) are intentionally NOT range-aware -- they
// own their own intrinsic period.

interface RevenuePoint { x: string, revenue: number, expenses: number }

// Smooth deterministic generator for medium-length series.
function genSeries(len: number, rStart: number, rEnd: number, eStart: number, eEnd: number, seed: number): RevenuePoint[] {
  return Array.from({ length: len }, (_, i) => {
    const t = len <= 1 ? 1 : i / (len - 1)
    return {
      x: String(i + 1),
      revenue: Math.round(rStart + (rEnd - rStart) * t + Math.sin((i + seed) * 0.7) * (rEnd - rStart) * 0.06),
      expenses: Math.round(eStart + (eEnd - eStart) * t + Math.sin((i + seed) * 0.9) * (eEnd - eStart) * 0.05),
    }
  })
}

const revenueByRange: Record<Range, RevenuePoint[]> = {
  '24h': Array.from({ length: 24 }, (_, h) => ({
    x: `${String(h).padStart(2, '0')}:00`,
    revenue: Math.round(150 + Math.sin((h - 6) / 24 * Math.PI * 2) * 90 + ((h * 7) % 40)),
    expenses: Math.round(80 + Math.sin((h - 8) / 24 * Math.PI * 2) * 30 + ((h * 11) % 20)),
  })),
  '7d': [
    { x: 'Mon', revenue: 4380, expenses: 3120 },
    { x: 'Tue', revenue: 4480, expenses: 3210 },
    { x: 'Wed', revenue: 4560, expenses: 3260 },
    { x: 'Thu', revenue: 4620, expenses: 3300 },
    { x: 'Fri', revenue: 4720, expenses: 3380 },
    { x: 'Sat', revenue: 3920, expenses: 2940 },
    { x: 'Sun', revenue: 3680, expenses: 2820 },
  ],
  '30d': genSeries(30, 4180, 4720, 3000, 3380, 17),
  qtd: genSeries(12, 28000, 33000, 20000, 23000, 41).map((p, i) => ({ ...p, x: `W${i + 1}` })),
  // Monthly revenue tracks MRR: ~$73k in Jan -> $115.7k in Sep (+58.6%).
  ytd: [
    { x: 'Jan', revenue: 73000, expenses: 58000 },
    { x: 'Feb', revenue: 77800, expenses: 60500 },
    { x: 'Mar', revenue: 82900, expenses: 62400 },
    { x: 'Apr', revenue: 88100, expenses: 65200 },
    { x: 'May', revenue: 93600, expenses: 67100 },
    { x: 'Jun', revenue: 99200, expenses: 69800 },
    { x: 'Jul', revenue: 104500, expenses: 72300 },
    { x: 'Aug', revenue: 110300, expenses: 74900 },
    { x: 'Sep', revenue: 115700, expenses: 77600 },
  ],
  custom: genSeries(14, 4280, 4720, 3060, 3380, 71).map((p, i) => ({ ...p, x: `D${i + 1}` })),
}

interface RequestsBlock {
  title: string
  subtitle: string
  data: { x: string, y: number }[]
}

const requestsByRange: Record<Range, RequestsBlock> = {
  '24h': {
    title: 'Requests by hour',
    subtitle: 'Today · UTC',
    data: Array.from({ length: 24 }, (_, h) => ({
      x: `${String(h).padStart(2, '0')}:00`,
      // Deterministic so SSR + client match (no Math.random).
      y: Math.round(800 + Math.sin((h - 6) / 24 * Math.PI * 2) * 500 + ((h * 53) % 200)),
    })),
  },
  '7d': {
    title: 'Requests by day',
    subtitle: 'Last 7 days · UTC',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
      x: d,
      y: Math.round(28000 + Math.sin(i * 1.1) * 4200 + i * 380),
    })),
  },
  '30d': {
    title: 'Requests by day',
    subtitle: 'Last 30 days · UTC',
    data: Array.from({ length: 30 }, (_, i) => ({
      x: String(i + 1),
      y: Math.round(26000 + Math.sin(i * 0.7) * 3800 + ((i * 17) % 2400)),
    })),
  },
  qtd: {
    title: 'Requests by week',
    subtitle: 'Quarter to date · UTC',
    data: Array.from({ length: 12 }, (_, i) => ({
      x: `W${i + 1}`,
      y: Math.round(180000 + Math.sin(i * 0.9) * 24000 + i * 2400),
    })),
  },
  ytd: {
    title: 'Requests by month',
    subtitle: 'Year to date · UTC',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({
      x: m,
      y: Math.round(720000 + i * 86000 + Math.sin(i * 1.2) * 38000),
    })),
  },
  custom: {
    title: 'Requests by day',
    subtitle: 'Custom range · UTC',
    data: Array.from({ length: 14 }, (_, i) => ({
      x: `D${i + 1}`,
      y: Math.round(26500 + Math.sin(i * 0.8) * 3600 + ((i * 19) % 2200)),
    })),
  },
}

// Funnel: ratios stay constant across ranges (60% -> 40% -> 30% -> 25%);
// only the absolute visitor count scales with the window.
// `value` is the REAL count -- horizontal bars encode length = count, so the
// old triangle trick (inflating Paid / Retained 30d to Activated's width so
// the tip stayed labellable) is gone. `realValue` is kept = value for
// backward compatibility with consumers/ports that read it.
function buildFunnel(visitors: number) {
  const signups = Math.round(visitors * 0.6)
  const activated = Math.round(signups * 0.4)
  const paid = Math.round(activated * 0.3)
  const retained = Math.round(paid * 0.25)
  return [
    { name: 'Visitors', value: visitors, realValue: visitors },
    { name: 'Sign-ups', value: signups, realValue: signups },
    { name: 'Activated', value: activated, realValue: activated },
    { name: 'Paid', value: paid, realValue: paid },
    { name: 'Retained 30d', value: retained, realValue: retained },
  ]
}

const VISITORS_BY_RANGE: Record<Range, number> = {
  // Hand-picked so successive Math.round steps land back on the exact
  // 60/40/30/25 ratios (and 1.8% end-to-end) at 1-decimal display rounding
  // on EVERY range -- the card footer prints the computed step rates, so a
  // rounding-hostile seed would read '29.9% → 25.4%' on small windows.
  '24h': 1000,
  '7d': 6000,
  '30d': 24850,
  qtd: 74600,
  ytd: 124200,
  custom: 14900,
}

// Top products: identity stays constant, only the change% varies per
// range (longer window -> bigger swing). Base list + per-range string
// table beats repeating five product objects five times.
const PRODUCT_BASE: Omit<Product, 'change'>[] = [
  { name: 'API · Pro tier', mrr: 48200, up: true },
  { name: 'Workspace · Team', mrr: 36400, up: true },
  { name: 'Batch endpoint', mrr: 14800, up: true },
  { name: 'Workspace · Enterprise', mrr: 12200, up: true },
  { name: 'API · Hobby', mrr: 4100, up: false },
]
const PRODUCT_CHANGE_BY_RANGE: Record<Range, string[]> = {
  '24h': ['+0.4%', '+0.3%', '+0.7%', '+0.1%', '-0.1%'],
  '7d': ['+2.8%', '+1.8%', '+4.9%', '+0.8%', '-0.5%'],
  '30d': ['+12.4%', '+8.1%', '+22.0%', '+3.8%', '-2.4%'],
  qtd: ['+24.1%', '+18.3%', '+38.2%', '+8.4%', '-4.2%'],
  ytd: ['+58.6%', '+42.5%', '+74.1%', '+18.7%', '-8.9%'],
  custom: ['+9.2%', '+6.2%', '+14.8%', '+2.1%', '-1.3%'],
}

// -- Remaining static data ------------------------------------------

export interface Activity {
  icon: LucideIcon
  iconClass: string
  title: string
  detail: string
  age: string
}

export interface Alert {
  icon: LucideIcon
  severity: 'critical' | 'warning' | 'info'
  title: string
  detail: string
  /** Service and region the alert fired from. */
  source: string
  age: string
}

export interface Customer {
  name: string
  plan: string
  mrr: number
  status: 'healthy' | 'at-risk' | 'churned'
  avatar: string
}

export interface Product {
  name: string
  mrr: number
  change: string
  up: boolean
}

// ECharts paints on canvas and interpolates colours itself (visualMap,
// gauge bands), so theme tokens are resolved to plain rgb() here.
// Painting the CSS value into a 1px canvas converts any colour space
// (the semantic tokens are oklch) into sRGB bytes.
type Rgb = [number, number, number]
let probe: CanvasRenderingContext2D | null = null
function tokenRgb(name: string): Rgb {
  const fallback: Rgb = [128, 128, 128]
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!value) return fallback
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!probe) return fallback
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = value
  probe.fillRect(0, 0, 1, 1)
  const [r = 128, g = 128, b = 128] = probe.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}
const rgb = ([r, g, b]: Rgb, alpha = 1) => (alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`)

// Quota gauge bands follow the UsageBar rule: < 70% fine, 70-89% warning,
// >= 90% at the limit. Same API-calls meter as Settings -> Billing / Limits.
// Port of the Nuxt `SAMPLE_USAGE` api-calls meter (482,300 / 1,000,000)
// and `SAMPLE_PLAN` cycle end (2026-10-01).
const QUOTA_USED_VALUE = 482300
const QUOTA_LIMIT_VALUE = 1000000
const QUOTA_USED = Math.min(100, Math.round((QUOTA_USED_VALUE / QUOTA_LIMIT_VALUE) * 100))
const QUOTA_META = {
  used: QUOTA_USED_VALUE,
  limit: QUOTA_LIMIT_VALUE,
  remaining: QUOTA_LIMIT_VALUE - QUOTA_USED_VALUE,
  // `renews` is computed per-locale inside the hook (see below) so the
  // date follows the UI language; this English string is the fallback.
  renews: new Date('2026-10-01').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
}

// Headcount by department. Five cells (one per chart token) keep every
// rect big enough for its full label. Totals match the office list
// (1,221 people across 12 offices, lib/locations.ts).
const segments = [
  { name: 'Engineering', value: 486 },
  { name: 'Sales', value: 298 },
  { name: 'Customer success', value: 184 },
  { name: 'Marketing', value: 142 },
  { name: 'G&A', value: 111 },
]
const totalHeadcount = segments.reduce((s, d) => s + d.value, 0)
const totalDepartments = segments.length

// Anchor to a fixed date so SSR + client produce identical strings
// and values (Math.random() / new Date() would diverge between
// renders and trigger a hydration text mismatch). Update this
// baseline whenever the demo data is refreshed.
const calendarAnchor = new Date('2026-09-28T00:00:00Z')
function seeded(i: number): number {
  // Cheap deterministic pseudo-random: keeps the heatmap visually
  // busy without importing a seed library.
  const x = Math.sin(i * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
const calendarData: [string, number][] = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(calendarAnchor)
  d.setUTCDate(calendarAnchor.getUTCDate() - i)
  const iso = d.toISOString().slice(0, 10)
  const dow = d.getUTCDay()
  const base = (dow === 0 || dow === 6) ? 0 : 3
  const recent = i < 60 ? 4 : 0
  return [iso, Math.max(0, Math.round(base + recent + (seeded(i) - 0.3) * 6))]
})
const calendarRange: [string, string] = [
  new Date(calendarAnchor.getTime() - 364 * 86400_000).toISOString().slice(0, 10),
  calendarAnchor.toISOString().slice(0, 10),
]

const alerts: Alert[] = [
  // All five are open -- matches "5 open" in the card header.
  { icon: ShieldAlert, severity: 'critical', title: 'Rate limit p99 breached', detail: '3,420/min vs 3,000 cap. 4 customers throttled.', source: 'api-gateway · us-east', age: '7m ago' },
  { icon: AlertTriangle, severity: 'warning', title: 'Background workers degraded', detail: 'p95 412ms over the last 8 minutes.', source: 'workers · eu-west', age: '38m ago' },
  { icon: Info, severity: 'info', title: 'Webhook retries climbing', detail: '312 retries in the last hour to 2 customer endpoints.', source: 'webhooks · global', age: '1h ago' },
  { icon: GitBranch, severity: 'warning', title: 'Deploy pipeline queued', detail: '14 builds waiting over the last 20 minutes.', source: 'ci · us-west', age: '2h ago' },
  { icon: CreditCard, severity: 'info', title: 'Usage at 80% of plan', detail: 'API quota projected to hit the cap in 6 days.', source: 'billing · global', age: '3h ago' },
]

// Ranked list: keep sorted by MRR, highest first.
const topCustomers: Customer[] = [
  { name: 'Olympus Robotics', plan: 'Enterprise', mrr: 5200, status: 'healthy', avatar: 'OR' },
  { name: 'Northwind Industries', plan: 'Enterprise', mrr: 4800, status: 'healthy', avatar: 'NI' },
  { name: 'Sentinel Labs', plan: 'Enterprise', mrr: 3600, status: 'healthy', avatar: 'SL' },
  { name: 'Crescent Health', plan: 'Pro', mrr: 1800, status: 'healthy', avatar: 'CH' },
  { name: 'Apex Logistics', plan: 'Pro', mrr: 1200, status: 'at-risk', avatar: 'AL' },
  { name: 'Polaris Software', plan: 'Pro', mrr: 980, status: 'healthy', avatar: 'PS' },
]

// Option for the Bar/Area mini-charts in the KPI tiles: no axes, grid,
// tooltip or legend. The chart wrappers spread `option` over their own
// object, so `xAxis`/`yAxis` here REPLACE the wrapper's axes -- they
// must carry the axis `type` and the category `data` again, or ECharts
// loses the categories and collapses the series into one stray bar.
// WHY: zero-based, not floored under the series minimum -- a
// 12.5k → 12.8k ramp floored at 12.4k reads as a surge. Minis keep shape
// (Sparkline is trend-only); the zero base keeps them honest.
// Never include `series` here.
export function miniChart(values: number[]) {
  return {
    grid: { left: 0, right: 0, top: 2, bottom: 0, containLabel: false },
    xAxis: { type: 'category', show: false, boundaryGap: true, data: values.map((_, i) => i) },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
    },
    tooltip: { show: false },
    legend: { show: false },
  }
}

// Activity feed icons sit inside `IconBox variant="muted"`. The icon
// category is communicated by the title text -- the icon hue does not
// need to carry severity, so all six use `text-muted-foreground` for
// a quiet, uniform feed. Use a semantic colour only where it carries
// information the title doesn't already (alerts, status dots).
const activities: Activity[] = [
  { icon: UserPlus, iconClass: 'text-muted-foreground', title: 'Olive Park accepted invite', detail: 'Joined Acme Inc as Member', age: '2m ago' },
  { icon: CreditCard, iconClass: 'text-muted-foreground', title: 'Northwind paid INV-2031', detail: '$2,400 via Visa ··4242', age: '47m ago' },
  { icon: GitBranch, iconClass: 'text-muted-foreground', title: 'Deploy succeeded on main', detail: 'commit 4e8a91c — Dashboard reset', age: '1h ago' },
  { icon: AlertTriangle, iconClass: 'text-muted-foreground', title: 'Background workers degraded', detail: 'p95 412ms over last 8m', age: '3h ago' },
  { icon: MessageSquare, iconClass: 'text-muted-foreground', title: 'Sentinel Labs left feedback', detail: '"Streaming citations are a game-changer"', age: '5h ago' },
  { icon: CheckCircle2, iconClass: 'text-muted-foreground', title: 'Daily report sent to ops@acme.com', detail: '37 tasks closed, 12 opened', age: 'Yesterday' },
]

// MRR per product is identity across ranges (only the change% varies),
// so the running total is a plain constant -- no need to recompute on
// range flips.
const totalMrr = PRODUCT_BASE.reduce((s, p) => s + p.mrr, 0)
const totalDeploys = calendarData.reduce((s, [, v]) => s + v, 0)
// WHY: fixed-anchor "as of" label so the dashboard header
// and the heatmap card can stamp visible freshness without new Date()
// (which would diverge between SSR + client and mismatch hydration).
const asOfLabel = calendarAnchor.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const statusTone: Record<Customer['status'], string> = {
  healthy: 'bg-success',
  'at-risk': 'bg-warning',
  churned: 'bg-destructive',
}

export function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function useDashboardData(range: Range = '30d', locale = 'en') {
  // Theme tokens for the canvas charts. Subscribing to `useChartTheme`
  // re-resolves (and re-renders) whenever the consumer flips their
  // dark-mode class; the CSS-var reads below ride along because they
  // re-run on the same render.
  const theme = useChartTheme()

  const kpi = useMemo(() => KPI_BY_RANGE[range], [range])
  const rangeLabel = useMemo(() => RANGE_LABEL[range], [range])

  // Profit and refunds are derived per point so they always agree with the
  // revenue/expenses lines for whichever range is selected.
  const revenueSeries = useMemo(() => revenueByRange[range].map((p, i) => ({
    ...p,
    profit: p.revenue - p.expenses,
    refunds: Math.round(p.revenue * (0.03 + ((i * 7) % 5) * 0.002)),
  })), [range])

  // Revenue combo: revenue/expenses as bars, profit/refunds as lines on the
  // same axis. Colours and chrome come from the theme so it follows light,
  // dark and the colour-theme presets like the other charts.
  const revenueComboOption = useMemo(() => {
    // Four groups for every range keeps the combo readable in a one-third
    // card. Groups can differ in length (30 days -> 8/8/8/6), so each shows
    // the per-point average rather than a sum -- otherwise a short last group
    // reads as a fake dip. Labelled with its span, e.g. "1-8" or "Mon-Tue".
    const raw = revenueSeries
    const GROUPS = 4
    const size = Math.ceil(raw.length / GROUPS)
    const pts = Array.from({ length: Math.ceil(raw.length / size) }, (_, b) => {
      const chunk = raw.slice(b * size, b * size + size)
      const sum = (k: 'revenue' | 'expenses' | 'profit' | 'refunds') => Math.round(chunk.reduce((t, p) => t + p[k], 0) / chunk.length)
      const first = chunk[0]!.x
      const last = chunk[chunk.length - 1]!.x
      return { x: first === last ? first : `${first}–${last}`, revenue: sum('revenue'), expenses: sum('expenses'), profit: sum('profit'), refunds: sum('refunds') }
    })
    const c = theme.colors
    const surface = rgb(tokenRgb('--card'))
    const perPoint = size > 1 ? ' avg' : ''
    const money = (v: number) => `$${Math.round(v).toLocaleString()}${perPoint}`
    const kFmt = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))
    const line = (name: string, key: 'profit' | 'refunds', color: string, dashed = false) => ({
      name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      yAxisIndex: 1,
      data: pts.map(p => p[key]),
      lineStyle: { width: 3, color, type: dashed ? 'dashed' : 'solid' },
      itemStyle: { color, borderColor: surface, borderWidth: 2 },
      emphasis: { focus: 'series' },
      z: 5,
    })
    const bar = (name: string, key: 'revenue' | 'expenses', color: string) => ({
      name,
      type: 'bar',
      barMaxWidth: 22,
      barGap: '15%',
      data: pts.map(p => p[key]),
      // Bars are the context, lines the story: keep the bars faint.
      itemStyle: { color, borderRadius: [3, 3, 0, 0], opacity: 0.3 },
      emphasis: { focus: 'series', itemStyle: { opacity: 0.6 } },
      // WHY: one fixed demo annotation on an obvious dip so the
      // combo teaches event overlays. Clearly fake data (see label copy).
      markLine: name === 'Revenue'
        ? {
            silent: true,
            symbol: 'none',
            lineStyle: { color, type: 'dashed', width: 1 },
            label: { formatter: 'Deploy v2.4 (demo)', fontSize: 12, color: theme.textColor },
            data: [{ xAxis: pts[Math.min(2, pts.length - 1)]!.x }],
          }
        : undefined,
    })
    return {
      grid: { left: 8, right: 8, top: 32, bottom: 32, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: money,
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.tooltipText, fontSize: 12 },
      },
      legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12, color: theme.textColor } },
      xAxis: {
        type: 'category',
        data: pts.map(p => p.x),
        axisLine: { lineStyle: { color: theme.axisColor } },
        axisLabel: { color: theme.textColor, fontSize: 12 },
        axisTick: { show: false },
      },
      // Left axis: bars (revenue/expenses). Right axis: lines (profit/refunds),
      // so the smaller line values use the full height instead of hugging 0.
      // WHY: both zero-based -- bars encode length from zero.
      // Each axis is named with its own unit so the dual
      // scales are never implied shared.
      yAxis: [
        {
          type: 'value',
          min: 0,
          splitNumber: 4,
          name: 'Revenue · USD',
          nameTextStyle: { color: theme.textColor, fontSize: 12, align: 'left' },
          splitLine: { lineStyle: { color: theme.splitLineColor } },
          axisLabel: { color: theme.textColor, fontSize: 12, formatter: kFmt },
        },
        {
          type: 'value',
          min: 0,
          splitNumber: 4,
          name: 'Profit · USD',
          nameTextStyle: { color: theme.textColor, fontSize: 12, align: 'right' },
          splitLine: { show: false },
          axisLabel: { color: theme.textColor, fontSize: 12, formatter: kFmt },
        },
      ],
      series: [
        bar('Revenue', 'revenue', c[0]!),
        bar('Expenses', 'expenses', c[1]!),
        line('Profit', 'profit', c[2]!),
        line('Refunds', 'refunds', c[3]!, true),
      ],
    }
  }, [revenueSeries, theme])

  const requestsBlock = useMemo(() => requestsByRange[range], [range])

  // Stepwise conversion rates: Sign-ups retains 60% of Visitors,
  // Activated 40% of Sign-ups, Paid 30% of Activated, Retained 25% of
  // Paid. End-to-end = 0.60 * 0.40 * 0.30 * 0.25 = 1.8% of Visitors.
  const funnel = useMemo(() => buildFunnel(VISITORS_BY_RANGE[range]), [range])

  // Range-aware funnel facts for the card subtitle/footer
  // ('447 of 24,850 retained (1.8% end-to-end)', 'Step rates: ...').
  const funnelSummary = useMemo(() => computeFunnelStats(normalizeFunnelStages(funnel)), [funnel])

  // WHY: prior-period totals so the funnel card footer can surface
  // a "vs prior period" comparison. The funnel tooltip's Δ is
  // stage-vs-stage, not period-vs-period -- this is the period baseline.
  // Fixed demo seed (~8% below the current window).
  const funnelPrior = useMemo(() => {
    const visitors = Math.round(VISITORS_BY_RANGE[range] * 0.92)
    const retained = Math.round(visitors * 0.018)
    return { visitors, retained }
  }, [range])

  // Horizontal staged-bar option layer for FunnelChart. Deliberately thin:
  // bar GEOMETRY (yAxis categories, single-hue series, outside labels) lives
  // in FunnelChart so standalone use matches the dashboard. This only
  // adds the range-aware accessible name -- it must NOT contain `series`,
  // `xAxis` or `yAxis` (the component merge is shallow; a `series` here
  // would replace the bars). Ports: mirror the component for geometry,
  // mirror this shape for the range-aware aria description.
  const funnelOption = useMemo(() => ({
    aria: {
      enabled: true,
      label: { description: describeFunnelForAria(funnelSummary, rangeLabel) },
    },
  }), [funnelSummary, rangeLabel])

  // Heatmap ramp: chart-1 from faint to full, matching the legend
  // swatches on the page. Cell borders use the card surface so the grid
  // gaps disappear into the card in dark mode too.
  const calendarColorRange = useMemo<[string, string]>(() => {
    const chart1 = tokenRgb('--chart-1')
    return [rgb(chart1, 0.12), rgb(chart1)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])
  const calendarOption = useMemo(() => ({
    calendar: {
      top: 24,
      left: 36,
      right: 12,
      cellSize: ['auto', 14],
      range: calendarRange,
      itemStyle: { color: theme.splitLineColor, borderColor: rgb(tokenRgb('--card')), borderWidth: 2 },
      splitLine: { show: false },
      dayLabel: { color: theme.textColor, fontSize: 12, firstDay: 1, nameMap: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] },
      monthLabel: { color: theme.textColor, fontSize: 12, fontWeight: 600 },
      yearLabel: { show: false },
    },
  }), [theme])

  // Quota gauge: bands in status tokens; the progress arc takes the
  // colour of the band the current value sits in.
  const quotaUsed = QUOTA_USED
  // Locale-aware quota + freshness labels (module constants stay English
  // so SSR shells render before the locale is known; the hook memo
  // re-resolves them once `locale` arrives, like Nuxt's locale-valued
  // DateFormatter).
  const quotaMeta = useMemo(
    () => ({
      ...QUOTA_META,
      renews: new Date('2026-10-01').toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
    }),
    [locale],
  )
  const asOfLabel = useMemo(
    () => calendarAnchor.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }),
    [locale],
  )
  const gaugeOption = useMemo(() => {
    const t = {
      surface: rgb(tokenRgb('--card')),
      success: rgb(tokenRgb('--success')),
      warning: rgb(tokenRgb('--warning')),
      destructive: rgb(tokenRgb('--destructive')),
      track: rgb(tokenRgb('--muted')),
      foreground: rgb(tokenRgb('--foreground')),
      mutedForeground: rgb(tokenRgb('--muted-foreground')),
    }
    const thresholds: [number, string][] = [[0.7, t.success], [0.9, t.warning], [1, t.destructive]]
    // Progress ring instead of a speedometer: one thick rounded arc on a
    // muted track, the band colour carrying the status, and a thin outer
    // ring marking where the warning / limit bands start.
    const band = thresholds.find(([stop]) => quotaUsed / 100 < stop) ?? thresholds.at(-1)!
    const arc = { type: 'gauge', startAngle: 210, endAngle: -30, min: 0, max: 100, center: ['50%', '56%'] }
    const hidden = { axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, pointer: { show: false } }
    return {
      series: [
        {
          ...arc,
          ...hidden,
          radius: '92%',
          progress: { show: true, roundCap: true, width: 16, itemStyle: { color: band[1] } },
          axisLine: { roundCap: true, lineStyle: { width: 16, color: [[1, t.track]] } },
          anchor: { show: false },
          title: { show: true, offsetCenter: [0, '26%'], color: t.mutedForeground, fontSize: 12 },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '-4%'],
            formatter: '{v|{value}}{u|%}',
            rich: {
              v: { fontSize: 36, fontWeight: 600, color: t.foreground },
              u: { fontSize: 16, fontWeight: 500, color: t.mutedForeground, padding: [0, 0, 10, 2] },
            },
          },
          data: [{ value: quotaUsed, name: 'of monthly quota' }],
        },
        {
          // Threshold ring: success -> warning -> destructive, with a gap.
          ...arc,
          ...hidden,
          radius: '100%',
          axisLine: { lineStyle: { width: 3, color: thresholds.map(([stop, c]) => [stop, c]) } },
          detail: { show: false },
          title: { show: false },
          data: [],
          silent: true,
        },
      ],
    }
  }, [theme])

  const topProducts = useMemo<Product[]>(
    () => PRODUCT_BASE.map((p, i) => ({ ...p, change: PRODUCT_CHANGE_BY_RANGE[range][i]! })),
    [range],
  )

  return {
    revenueSeries,
    revenueComboOption,
    requestsBlock,
    funnel,
    funnelSummary,
    funnelPrior,
    funnelOption,
    segments,
    totalHeadcount,
    totalDepartments,
    calendarData,
    calendarRange,
    calendarColorRange,
    calendarOption,
    quotaUsed,
    gaugeOption,
    quotaMeta,
    topProducts,
    alerts,
    topCustomers,
    miniChart,
    activities,
    totalMrr,
    totalDeploys,
    asOfLabel,
    statusTone,
    formatK,
    kpi,
    rangeLabel,
  }
}
