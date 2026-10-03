// Pure funnel math + copy helpers shared by FunnelChart,
// use-dashboard-data.ts (funnelOption / funnelSummary) and the dashboard card.
// No ECharts, no React, no theme tokens here on purpose -- sibling repos port
// this file verbatim and only re-skin the chart chrome.
//
// Canonical demo ratios (kept constant across ranges; only the absolute
// visitor count scales with the selected window):
//   Visitors -> Sign-ups 60% -> Activated 40% -> Paid 30% -> Retained 25%
//   End-to-end = 0.60 * 0.40 * 0.30 * 0.25 = 1.8% of Visitors.

export interface FunnelStageInput {
  name: string
  value: number
  /** Legacy triangle-funnel field. Preferred when present. */
  realValue?: number
}

export interface FunnelStage {
  name: string
  value: number
}

export interface FunnelStep {
  name: string
  value: number
  /** Step conversion vs the previous stage, in percent (null on the first stage). */
  stepRate: number | null
  /** Previous stage name, for 'X% from <prev>' pills. */
  prevName: string | null
  /** Share of the top stage, in percent. */
  cumulative: number
  /** Absolute change vs the previous stage (null on the first stage). */
  delta: number | null
}

export interface FunnelStats {
  visitors: number
  retained: number
  /** End-to-end retention, in percent (retained / visitors * 100). */
  endToEnd: number
  steps: FunnelStep[]
}

// Old triangle-funnel payloads carry the real count in `realValue` (the
// `value` field was inflated so tail stages rendered). Horizontal bars
// encode length = count, so the real count is the only truth.
export function normalizeFunnelStages(input: FunnelStageInput[]): FunnelStage[] {
  return input.map((d) => ({ name: d.name, value: d.realValue ?? d.value }))
}

export function computeFunnelStats(stages: FunnelStage[]): FunnelStats {
  const top = stages[0]?.value ?? 0
  const steps = stages.map((s, i) => {
    const prev = i > 0 ? stages[i - 1]!.value : null
    return {
      name: s.name,
      value: s.value,
      stepRate: prev === null ? null : prev === 0 ? 0 : (s.value / prev) * 100,
      prevName: i > 0 ? stages[i - 1]!.name : null,
      cumulative: top === 0 ? 0 : (s.value / top) * 100,
      delta: prev === null ? null : s.value - prev,
    }
  })
  const retained = stages.length > 0 ? stages[stages.length - 1]!.value : 0
  return {
    visitors: top,
    retained,
    endToEnd: top === 0 ? 0 : (retained / top) * 100,
    steps,
  }
}

// One decimal, trailing '.0' trimmed: 60 -> '60%', 7.199 -> '7.2%', 1.7987 -> '1.8%'.
export function formatPct(n: number): string {
  const r = Math.round(n * 10) / 10
  return `${Number.isInteger(r) ? String(r) : r.toFixed(1)}%`
}

// Single-hue sequential depth: full strength on the first stage fading to
// 0.45 on the last. Applied as ECharts item opacity over the theme primary,
// so dark mode only re-resolves the hue, never the ramp.
export function funnelBarOpacity(index: number, total: number): number {
  if (total <= 1) return 1
  return Math.round((1 - (index * 0.55) / (total - 1)) * 100) / 100
}

// Card footer copy: 'Step rates: 60% -> 40% -> 30% -> 25%'.
export function formatStepRatesLine(stats: FunnelStats): string {
  const rates = stats.steps.filter((s) => s.stepRate !== null).map((s) => formatPct(s.stepRate!))
  return `Step rates: ${rates.join(' → ')}`
}

// Step pill copy: baseline row '100% - Visitors', later rows '-> 60% from Visitors'.
export function formatStepPill(step: FunnelStep): string {
  if (step.stepRate === null || step.prevName === null) return `100% · ${step.name}`
  return `→ ${formatPct(step.stepRate)} from ${step.prevName}`
}

// Canvas accessible name (also used for the wrapper role='img' aria-label).
export function describeFunnelForAria(stats: FunnelStats, contextLabel?: string): string {
  const head = contextLabel ? `Conversion funnel, ${contextLabel}: ` : 'Conversion funnel: '
  const rows = stats.steps.map((s) => {
    const count = s.value.toLocaleString()
    if (s.stepRate === null) return `${s.name} ${count}, 100% of top`
    const sign = s.delta !== null && s.delta < 0 ? '−' : '+'
    const delta = s.delta === null ? '' : ` (${sign}${Math.abs(s.delta).toLocaleString()} vs prior)`
    return `${s.name} ${count}, ${formatPct(s.stepRate)} step from ${s.prevName}, ${formatPct(s.cumulative)} cumulative${delta}`
  })
  return `${head}${rows.join('; ')}. End-to-end ${formatPct(stats.endToEnd)} retained.`
}
