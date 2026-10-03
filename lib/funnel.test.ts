import { describe, it, expect } from 'vitest'
import {
  computeFunnelStats, describeFunnelForAria, formatPct, formatStepPill,
  formatStepRatesLine, funnelBarOpacity, normalizeFunnelStages,
} from './funnel'

// 30d demo window: Visitors 24850, fixed 60/40/30/25 ratios.
const STAGES_30D = [
  { name: 'Visitors', value: 24850 },
  { name: 'Sign-ups', value: 14910 },
  { name: 'Activated', value: 5964 },
  { name: 'Paid', value: 1789 },
  { name: 'Retained 30d', value: 447 },
]

describe('normalizeFunnelStages', () => {
  it('prefers realValue (legacy triangle payloads)', () => {
    expect(normalizeFunnelStages([
      { name: 'Paid', value: 5964, realValue: 1789 },
      { name: 'Retained 30d', value: 5964, realValue: 447 },
    ])).toEqual([
      { name: 'Paid', value: 1789 },
      { name: 'Retained 30d', value: 447 },
    ])
  })

  it('falls back to value when realValue is absent', () => {
    expect(normalizeFunnelStages(STAGES_30D)).toEqual(STAGES_30D)
  })
})

describe('computeFunnelStats (30d demo)', () => {
  const stats = computeFunnelStats(STAGES_30D)

  it('keeps absolute head/tail counts', () => {
    expect(stats.visitors).toBe(24850)
    expect(stats.retained).toBe(447)
  })

  it('derives the 60/40/30/25 step rates', () => {
    expect(stats.steps.map((s) => (s.stepRate === null ? null : formatPct(s.stepRate)))).toEqual(
      [null, '60%', '40%', '30%', '25%'],
    )
  })

  it('derives cumulative share of top', () => {
    expect(stats.steps.map((s) => formatPct(s.cumulative))).toEqual(['100%', '60%', '24%', '7.2%', '1.8%'])
  })

  it('computes 1.8% end-to-end', () => {
    expect(formatPct(stats.endToEnd)).toBe('1.8%')
  })

  it('tracks deltas vs the prior stage (null on baseline)', () => {
    expect(stats.steps.map((s) => s.delta)).toEqual([null, -9940, -8946, -4175, -1342])
  })
})

describe('computeFunnelStats (every range seed keeps ratios)', () => {
  // Mirrors VISITORS_BY_RANGE in use-dashboard-data. Chained Math.round must
  // land back on exactly 60/40/30/25 (1.8% end-to-end) or the card footer
  // prints rounding noise like '29.9% → 25.4%'.
  const chain = (visitors: number) => {
    const signups = Math.round(visitors * 0.6)
    const activated = Math.round(signups * 0.4)
    const paid = Math.round(activated * 0.3)
    const retained = Math.round(paid * 0.25)
    return [
      { name: 'Visitors', value: visitors },
      { name: 'Sign-ups', value: signups },
      { name: 'Activated', value: activated },
      { name: 'Paid', value: paid },
      { name: 'Retained 30d', value: retained },
    ]
  }

  it.each([1000, 6000, 24850, 74600, 124200, 14900])('seed %i yields exact ratios', (visitors) => {
    const stats = computeFunnelStats(chain(visitors))
    expect(stats.steps.map((s) => (s.stepRate === null ? null : formatPct(s.stepRate)))).toEqual(
      [null, '60%', '40%', '30%', '25%'],
    )
    expect(formatPct(stats.endToEnd)).toBe('1.8%')
  })

  it('guards divide-by-zero on empty input', () => {
    const stats = computeFunnelStats([])
    expect(stats).toEqual({ visitors: 0, retained: 0, endToEnd: 0, steps: [] })
    expect(formatStepRatesLine(stats)).toBe('Step rates: ')
  })
})

describe('formatters', () => {
  const stats = computeFunnelStats(STAGES_30D)

  it('formats the card footer line exactly', () => {
    expect(formatStepRatesLine(stats)).toBe('Step rates: 60% → 40% → 30% → 25%')
  })

  it('formats step pills with the source stage', () => {
    expect(formatStepPill(stats.steps[0]!)).toBe('100% · Visitors')
    expect(formatStepPill(stats.steps[1]!)).toBe('→ 60% from Visitors')
    expect(formatStepPill(stats.steps[4]!)).toBe('→ 25% from Paid')
  })

  it('trims trailing .0 but keeps real decimals', () => {
    expect(formatPct(60)).toBe('60%')
    expect(formatPct(1.7987)).toBe('1.8%')
    expect(formatPct(7.199)).toBe('7.2%')
  })

  it('describes the funnel for assistive tech', () => {
    const label = describeFunnelForAria(stats, 'Last 30 days')
    expect(label).toContain('Conversion funnel, Last 30 days: Visitors 24,850, 100% of top')
    expect(label).toContain('Retained 30d 447, 25% step from Paid, 1.8% cumulative')
    expect(label).toContain('End-to-end 1.8% retained.')
  })
})

describe('funnelBarOpacity', () => {
  it('ramps 1.0 to 0.45 across five stages, monotonically', () => {
    const ramp = [0, 1, 2, 3, 4].map((i) => funnelBarOpacity(i, 5))
    expect(ramp[0]).toBe(1)
    expect(ramp[4]).toBe(0.45)
    expect([...ramp].sort((a, b) => b - a)).toEqual(ramp)
  })

  it('returns full strength for a single stage', () => {
    expect(funnelBarOpacity(0, 1)).toBe(1)
  })
})
