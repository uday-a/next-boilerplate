'use client'

import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  GitBranch,
  MessageSquare,
  ShieldAlert,
  UserPlus,
} from 'lucide-react'

export type Range = '24h' | '7d' | '30d' | 'qtd' | 'ytd'

const RANGE_LABEL: Record<Range, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  qtd: 'Quarter to date',
  ytd: 'Year to date',
}

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
    spark: {
      revenue: [2980, 3320, 3780, 4180, 4720],
      users: [9000, 9800, 10800, 11800, 12847],
      requests: [1880, 2080, 2240, 2360, 2484],
      conversion: [5.3, 5.9, 6.5, 7.0, 7.4],
      latency: [365, 380, 395, 405, 412],
    },
  },
}

interface RevenuePoint {
  x: string
  revenue: number
  expenses: number
}

function genSeries(
  len: number,
  rStart: number,
  rEnd: number,
  eStart: number,
  eEnd: number,
  seed: number,
): RevenuePoint[] {
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
    revenue: Math.round(150 + Math.sin(((h - 6) / 24) * Math.PI * 2) * 90 + ((h * 7) % 40)),
    expenses: Math.round(80 + Math.sin(((h - 8) / 24) * Math.PI * 2) * 30 + ((h * 11) % 20)),
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
  ytd: [
    { x: 'Jan', revenue: 184000, expenses: 108000 },
    { x: 'Feb', revenue: 172000, expenses: 112000 },
    { x: 'Mar', revenue: 198000, expenses: 118000 },
    { x: 'Apr', revenue: 224000, expenses: 124000 },
    { x: 'May', revenue: 248000, expenses: 132000 },
  ],
}

interface RequestsBlock {
  title: string
  subtitle: string
  data: { x: string; y: number }[]
}

const requestsByRange: Record<Range, RequestsBlock> = {
  '24h': {
    title: 'Requests by hour',
    subtitle: 'Today · UTC',
    data: Array.from({ length: 24 }, (_, h) => ({
      x: `${String(h).padStart(2, '0')}:00`,
      y: Math.round(800 + Math.sin(((h - 6) / 24) * Math.PI * 2) * 500 + ((h * 53) % 200)),
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
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, i) => ({
      x: m,
      y: Math.round(720000 + i * 86000 + Math.sin(i * 1.2) * 38000),
    })),
  },
}

function buildFunnel(visitors: number) {
  const signups = Math.round(visitors * 0.6)
  const activated = Math.round(signups * 0.4)
  const paid = Math.round(activated * 0.3)
  const retained = Math.round(paid * 0.25)
  return [
    { name: 'Visitors', value: visitors, realValue: visitors },
    { name: 'Sign-ups', value: signups, realValue: signups },
    { name: 'Activated', value: activated, realValue: activated },
    { name: 'Paid', value: activated, realValue: paid },
    { name: 'Retained 30d', value: activated, realValue: retained },
  ]
}

const VISITORS_BY_RANGE: Record<Range, number> = {
  '24h': 820,
  '7d': 5740,
  '30d': 24850,
  qtd: 74600,
  ytd: 124200,
}

export interface Product {
  name: string
  mrr: number
  change: string
  up: boolean
}

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
}

export interface Activity {
  icon: LucideIcon
  iconClass: string
  title: string
  detail: string
  age: string
}

export interface Alert {
  icon: LucideIcon
  tone: string
  title: string
  detail: string
  age: string
}

export interface Customer {
  name: string
  plan: string
  mrr: number
  status: 'healthy' | 'at-risk' | 'churned'
  avatar: string
}

const rawSegments = [
  { name: 'Backend', value: 22 },
  { name: 'Frontend', value: 18 },
  { name: 'Inside sales', value: 14 },
  { name: 'Field sales', value: 12 },
  { name: 'Customer success', value: 10 },
  { name: 'Marketing', value: 8 },
  { name: 'Support', value: 8 },
  { name: 'Mobile', value: 8 },
  { name: 'Infra', value: 8 },
  { name: 'Sales ops', value: 6 },
  { name: 'People', value: 4 },
  { name: 'Finance', value: 4 },
  { name: 'Design', value: 2 },
]

const segmentsVisibleCount = 8
const segmentsSorted = [...rawSegments].sort((a, b) => b.value - a.value)
const segments = [
  ...segmentsSorted.slice(0, segmentsVisibleCount),
  {
    name: `Other (${segmentsSorted.length - segmentsVisibleCount})`,
    value: segmentsSorted.slice(segmentsVisibleCount).reduce((s, x) => s + x.value, 0),
  },
]
const totalHeadcount = rawSegments.reduce((s, d) => s + d.value, 0)
const totalTeams = rawSegments.length

const calendarAnchor = new Date('2026-05-15T00:00:00Z')
function seeded(i: number): number {
  const x = Math.sin(i * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
const calendarData: [string, number][] = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(calendarAnchor)
  d.setUTCDate(calendarAnchor.getUTCDate() - i)
  const iso = d.toISOString().slice(0, 10)
  const dow = d.getUTCDay()
  const base = dow === 0 || dow === 6 ? 0 : 3
  const recent = i < 60 ? 4 : 0
  return [iso, Math.max(0, Math.round(base + recent + (seeded(i) - 0.3) * 6))]
})
const calendarRange: [string, string] = [
  new Date(calendarAnchor.getTime() - 364 * 86400_000).toISOString().slice(0, 10),
  calendarAnchor.toISOString().slice(0, 10),
]

const alerts: Alert[] = [
  {
    icon: ShieldAlert,
    tone: 'text-rose-500',
    title: 'Quantum rate-limit p99 breached',
    detail: '3,420/min vs 3,000 cap. 4 customers throttled.',
    age: '7m ago',
  },
  {
    icon: AlertTriangle,
    tone: 'text-amber-500',
    title: 'Background workers degraded',
    detail: 'p95 412ms over last 8m. eu-west region only.',
    age: '38m ago',
  },
  {
    icon: CheckCircle2,
    tone: 'text-emerald-500',
    title: 'Deploy succeeded on main',
    detail: 'commit 4e8a91c — Dashboard reset.',
    age: '1h ago',
  },
]

const topCustomers: Customer[] = [
  { name: 'Northwind Industries', plan: 'Enterprise', mrr: 4800, status: 'healthy', avatar: 'NI' },
  { name: 'Sentinel Labs', plan: 'Enterprise', mrr: 3600, status: 'healthy', avatar: 'SL' },
  { name: 'Apex Logistics', plan: 'Pro', mrr: 1200, status: 'at-risk', avatar: 'AL' },
  { name: 'Olympus Robotics', plan: 'Enterprise', mrr: 5200, status: 'healthy', avatar: 'OR' },
  { name: 'Crescent Health', plan: 'Pro', mrr: 1800, status: 'healthy', avatar: 'CH' },
  { name: 'Polaris Software', plan: 'Pro', mrr: 980, status: 'healthy', avatar: 'PS' },
]

export const miniChrome = {
  grid: { left: 0, right: 0, top: 2, bottom: 2, containLabel: false },
  xAxis: { show: false, axisLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
  yAxis: { show: false, axisLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
  tooltip: { show: false },
  legend: { show: false },
}

const activities: Activity[] = [
  { icon: UserPlus, iconClass: 'text-muted-foreground', title: 'Olive Park accepted invite', detail: 'Joined Acme Inc as Member', age: '2m ago' },
  { icon: CreditCard, iconClass: 'text-muted-foreground', title: 'Northwind paid INV-2031', detail: '$2,400 via Visa ··4242', age: '47m ago' },
  { icon: GitBranch, iconClass: 'text-muted-foreground', title: 'Deploy succeeded on main', detail: 'commit 4e8a91c — Dashboard reset', age: '1h ago' },
  { icon: AlertTriangle, iconClass: 'text-muted-foreground', title: 'Background workers degraded', detail: 'p95 412ms over last 8m', age: '3h ago' },
  { icon: MessageSquare, iconClass: 'text-muted-foreground', title: 'Sentinel Labs left feedback', detail: '"Streaming citations are a game-changer"', age: '5h ago' },
  { icon: CheckCircle2, iconClass: 'text-muted-foreground', title: 'Daily report sent to ops@acme.com', detail: '37 tasks closed, 12 opened', age: 'Yesterday' },
]

const totalMrr = PRODUCT_BASE.reduce((s, p) => s + p.mrr, 0)
const totalDeploys = calendarData.reduce((s, [, v]) => s + v, 0)

export const statusTone: Record<Customer['status'], string> = {
  healthy: 'bg-emerald-500',
  'at-risk': 'bg-amber-500',
  churned: 'bg-rose-500',
}

export function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function useDashboardData(range: Range = '30d') {
  const kpi = useMemo(() => KPI_BY_RANGE[range], [range])
  const rangeLabel = useMemo(() => RANGE_LABEL[range], [range])
  const revenueSeries = useMemo(() => revenueByRange[range], [range])
  const requestsBlock = useMemo(() => requestsByRange[range], [range])
  const funnel = useMemo(() => buildFunnel(VISITORS_BY_RANGE[range]), [range])
  const funnelOption = useMemo(
    () => ({
      series: [
        {
          type: 'funnel',
          sort: 'none',
          left: '10%',
          right: '10%',
          top: 10,
          bottom: 24,
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            formatter: (p: { name: string; value: number; data?: { realValue?: number } }) =>
              `${p.name}\n${(p.data?.realValue ?? p.value).toLocaleString()}`,
          },
          labelLine: { length: 8, lineStyle: { width: 1, type: 'solid' } },
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
          emphasis: { label: { fontSize: 13, fontWeight: 700 } },
          data: funnel,
        },
      ],
    }),
    [funnel],
  )
  const topProducts = useMemo<Product[]>(
    () => PRODUCT_BASE.map((p, i) => ({ ...p, change: PRODUCT_CHANGE_BY_RANGE[range][i]! })),
    [range],
  )

  return {
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
  }
}