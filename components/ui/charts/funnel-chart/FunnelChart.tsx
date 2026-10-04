'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChartFrame, EChart } from '../shared'
import { useChartTheme } from '../useChartTheme'
import {
  computeFunnelStats, describeFunnelForAria, formatPct, formatStepPill,
  funnelBarOpacity, normalizeFunnelStages,
} from '@/lib/funnel'

// FunnelChart -- true ECharts funnel (triangle). Stage order top->bottom
// matches data order via sort:'none'. Single-hue chart-1 blue fading
// 1.0 -> 0.45 by depth; minSize keeps the tail wide enough that its inside
// label hides cleanly instead of truncating. HTML step pills + sr-only
// table below always carry the exact numbers.
// ─────────────────────────────────────────────────────────────────────────

// Solid stage colour = primary laid over the card surface at the depth
// opacity. Pre-blending (instead of item opacity) keeps the same-colour
// round-join stroke from showing as a darker ring where it overlaps the fill.
// A 1px canvas resolves any CSS colour format (hex, rgb, oklch).
function blendOver(fg: string, bg: string, alpha: number): string {
  if (alpha >= 1 || typeof document === 'undefined') return fg
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return fg
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1, 1)
  ctx.globalAlpha = alpha
  ctx.fillStyle = fg
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}

export interface FunnelChartProps {
  data: { name: string, value: number, realValue?: number }[]
  height?: number | string
  showLabels?: boolean
  showLegend?: boolean
  /** ECharts option escape hatch -- merged on top of the computed option. */
  option?: any
  className?: string
  /** Descriptive label override for the `role="img"` frame. */
  ariaLabel?: string
}

export const FunnelChart = React.forwardRef<HTMLDivElement, FunnelChartProps>(
  ({ data, height = 300, showLabels = true, showLegend = false, option, className, ariaLabel }, ref) => {
    const theme = useChartTheme()

    const stages = React.useMemo(() => normalizeFunnelStages(data), [data])
    const stats = React.useMemo(() => computeFunnelStats(stages), [stages])
    const defaultAria = React.useMemo(() => describeFunnelForAria(stats), [stats])
    // Range-aware description arrives via `option.aria` (see
    // use-dashboard-data `funnelOption`); the explicit prop wins, then the
    // option layer, then the context-free default.
    const resolvedAria = ariaLabel ?? (option as any)?.aria?.label?.description ?? defaultAria

    const mergedOption = React.useMemo(() => {
      // --chart-1 blue, NOT --primary (--primary is near-monochrome in both
      // themes and reads black/white; chart-1 keeps its hue by token contract).
      const primary = theme.colors[0] ?? '#2563eb'
      const base: any = {
        color: [primary],
        tooltip: {
          trigger: 'item',
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          textStyle: { color: theme.tooltipText, fontSize: 12 },
          formatter: (p: { dataIndex: number }) => {
            const s = stats.steps[p.dataIndex]
            if (!s) return ''
            const lines = [
              `<strong>${s.name}</strong>`,
              `Count: ${s.value.toLocaleString()}`,
              s.stepRate === null
                ? 'Baseline: 100% of top'
                : `Step rate: ${formatPct(s.stepRate)} of ${s.prevName}`,
              `Cumulative: ${formatPct(s.cumulative)} of top`,
            ]
            if (s.delta !== null) {
              const sign = s.delta < 0 ? '−' : '+'
              lines.push(`Δ vs prior: ${sign}${Math.abs(s.delta).toLocaleString()}`)
            }
            return lines.join('<br/>')
          },
        },
        aria: { enabled: true, label: { description: defaultAria } },
        legend: showLegend
          ? { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12, color: theme.textColor } }
          : undefined,
        series: [
          {
            name: 'Count',
            type: 'funnel',
            // Data order top->bottom (largest first in practice, but never
            // re-sorted -- equal stages keep their meaning).
            sort: 'none',
            orient: 'vertical',
            // Gap absorbs the 3px outer half of each stage's 6px round-join stroke
            // below, keeping a ~5px visible gutter between stages.
            gap: 11,
            // Tail floor: the last stage stays wide enough for its inside
            // label to hide cleanly instead of rendering truncated text.
            minSize: '28%',
            top: 8,
            bottom: 8,
            left: 8,
            right: 8,
            data: stages.map((s, i) => {
              const fill = blendOver(primary, theme.surfaceColor, funnelBarOpacity(i, stages.length))
              return {
                name: s.name,
                value: s.value,
                itemStyle: {
                  color: fill,
                  // ECharts funnel polygons have no borderRadius; a same-colour
                  // stroke with round joins softens the corners (~3px radius).
                  borderColor: fill,
                  borderWidth: 6,
                  borderJoin: 'round',
                },
              }
            }),
            // Smooth grow-in: staggered per-stage rise with a soft cubic-out
            // ease, re-played on range changes.
            animationDuration: 700,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 60,
            label: {
              show: showLabels,
              position: 'inside',
              // WHY: inside-label ink comes from the surface token, not
              // a raw '#fff' -- it tracks light/dark like every other token.
              color: theme.surfaceColor,
              fontSize: 12,
              fontWeight: 600,
              overflow: 'truncate',
              formatter: (p: { dataIndex: number }) => {
                const s = stats.steps[p.dataIndex]
                if (!s) return ''
                return `{t|${s.name}}\n{v|${s.value.toLocaleString()} · ${formatPct(s.cumulative)}}`
              },
              rich: {
                t: { fontSize: 12, fontWeight: 600, lineHeight: 16 },
                v: { fontSize: 12, fontWeight: 500, lineHeight: 16 },
              },
            },
            labelLayout: { hideOverlap: true },
            emphasis: { focus: 'self', scaleSize: 4 },
            // Non-hovered stages grey out (solid muted fill, readable label)
            // instead of ECharts' default near-transparent blur.
            blur: {
              itemStyle: { color: theme.mutedColor, borderColor: theme.mutedColor, opacity: 1 },
              label: { color: theme.textColor, opacity: 1 },
            },
          },
        ],
      }
      return { ...base, ...(option ?? {}) }
    }, [stages, stats, defaultAria, showLabels, showLegend, option, theme])

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <ChartFrame height={height} ariaLabel={resolvedAria} className="rounded-md">
          <EChart option={mergedOption} />
        </ChartFrame>
        {/* Step-conversion pills: HTML (not canvas) so they wrap instead of
            clipping at narrow widths. The sr-only table below is the precise
            screen-reader source; these pills are the glanceable summary. */}
        {stats.steps.length > 0 ? (
          <ul aria-label="Step conversion rates" className="mt-3 flex flex-wrap gap-1.5">
            {stats.steps.map((s, i) => (
              <li
                key={`${s.name}-${i}`}
                className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium tabular-nums"
              >
                {formatStepPill(s)}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="sr-only">
          <table>
            <caption>Conversion funnel by stage</caption>
            <thead>
              <tr>
                <th scope="col">Stage</th>
                <th scope="col">Count</th>
                <th scope="col">Step rate</th>
                <th scope="col">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {stats.steps.map((s, i) => (
                <tr key={`${s.name}-${i}`}>
                  <th scope="row">{s.name}</th>
                  <td>{s.value.toLocaleString()}</td>
                  <td>{s.stepRate === null ? '100% baseline' : `${formatPct(s.stepRate)} from ${s.prevName}`}</td>
                  <td>{formatPct(s.cumulative)} of top</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  },
)
FunnelChart.displayName = 'FunnelChart'
