// One sample source for plan + usage, shared by Settings -> Billing,
// Settings -> Limits and the Settings index meta line, so the numbers
// on every page agree. Swap for real metering data when you have it.

export interface UsageMetric {
  id: string
  label: string
  used: number
  limit: number
  unit?: string
  // 'cycle' resets with the billing period; 'total' is a workspace cap.
  period: 'cycle' | 'total'
  // Shown on Billing (billable meters) as well as Limits.
  billable: boolean
}

export const SAMPLE_PLAN = {
  name: 'Pro',
  price: 149,
  cycle: 'month',
  // ISO date; the current cycle ends here and monthly meters reset.
  renews: '2026-10-01',
}

export const SAMPLE_USAGE: UsageMetric[] = [
  { id: 'api-calls', label: 'API calls', used: 482_300, limit: 1_000_000, period: 'cycle', billable: true },
  { id: 'compute', label: 'Compute', used: 127.4, limit: 250, unit: 'h', period: 'cycle', billable: true },
  { id: 'storage', label: 'Storage', used: 38.2, limit: 100, unit: 'GB', period: 'total', billable: true },
  { id: 'seats', label: 'Team seats', used: 8, limit: 25, period: 'total', billable: true },
  { id: 'batch', label: 'Batch requests', used: 2_140, limit: 5_000, period: 'cycle', billable: false },
  { id: 'webhooks', label: 'Webhook deliveries', used: 184_600, limit: 250_000, period: 'cycle', billable: false },
  { id: 'bundles', label: 'Active file bundles', used: 47, limit: 50, period: 'total', billable: false },
]

export const SAMPLE_INVOICES = [
  { id: 'INV-2109', date: '2026-09-01', period: 'Aug 2026', amount: 149.00, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-2084', date: '2026-08-01', period: 'Jul 2026', amount: 162.40, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-2058', date: '2026-07-01', period: 'Jun 2026', amount: 149.00, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-2031', date: '2026-06-01', period: 'May 2026', amount: 149.00, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-2007', date: '2026-05-01', period: 'Apr 2026', amount: 149.00, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1983', date: '2026-04-01', period: 'Mar 2026', amount: 149.00, status: 'paid', method: 'Visa ··4242' },
]

export function usagePct(m: Pick<UsageMetric, 'used' | 'limit'>): number {
  return m.limit > 0 ? Math.min(100, Math.round((m.used / m.limit) * 100)) : 0
}

/** "482,300 / 1,000,000" or "127.4 h / 250 h". */
export function usageText(m: UsageMetric): string {
  const f = (n: number) => `${n.toLocaleString()}${m.unit ? ` ${m.unit}` : ''}`
  return `${f(m.used)} / ${f(m.limit)}`
}
