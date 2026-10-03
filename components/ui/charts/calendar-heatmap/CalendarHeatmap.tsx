'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react/lib/core'
import { cn } from '@/lib/utils'
import { ChartFrame, EChart, echartsCoreModule, heightToStyle } from '../shared'
import { useChartTheme, mergeOptionBlock, toRgba, gaugeThresholds } from '../useChartTheme'

// CalendarHeatmap
// ─────────────────────────────────────────────────────────────────────────

export interface CalendarHeatmapProps {
  /** [date string YYYY-MM-DD, value] tuples. */
  data: [string, number][]
  range: string | [string, string]
  height?: number | string
  /** Cell colour ramp [from, to] - default: --muted to --chart-1. */
  colorRange?: [string, string]
  option?: any
  className?: string
  /** Descriptive label for the `role="img"` frame. */
  ariaLabel?: string
}

export const CalendarHeatmap = React.forwardRef<HTMLDivElement, CalendarHeatmapProps>(
  ({ data, range, height = 200, colorRange: colorRangeProp, option, className, ariaLabel }, ref) => {
    const theme = useChartTheme()

    const mergedOption = React.useMemo(() => {
      const colorRange = colorRangeProp ?? [theme.mutedColor, theme.colors[0] ?? theme.primaryColor]
      const maxValue = data.reduce((m, [, v]) => Math.max(m, v), 0) || 1

      return {
        color: theme.colors,
        tooltip: {
          position: 'top',
          // WHY: this heatmap counts deploys, not "contributions",
          // and the value carries its unit so the tooltip never reads bare.
          formatter: (p: any) => `<strong>${p.value[0]}</strong><br>${p.value[1]} deploys`,
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          textStyle: { color: theme.tooltipText, fontSize: 12 },
        },
        visualMap: {
          show: false,
          min: 0,
          max: maxValue,
          inRange: { color: colorRange },
        },
        calendar: {
          top: 24,
          left: 36,
          right: 12,
          cellSize: ['auto', 14],
          range,
          itemStyle: { color: theme.splitLineColor, borderWidth: 0 },
          splitLine: { show: false },
          dayLabel: {
            color: theme.textColor,
            fontSize: 12,
            firstDay: 1,
            nameMap: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          },
          monthLabel: { color: theme.textColor, fontSize: 12, fontWeight: 600 },
          yearLabel: { show: false },
        },
        series: (() => {
          const series = [{ type: 'heatmap', coordinateSystem: 'calendar', data }]
          const userSeries = (option as any)?.series
          return Array.isArray(userSeries) ? series.map((s, i) => ({ ...s, ...(userSeries[i] ?? {}) })) : series
        })(),
        // Strip `series` from the rest spread so the merge above isn't clobbered.
        ...(() => {
          const { series: _, ...rest } = (option as any) ?? {}
          return rest
        })(),
      }
    }, [data, range, colorRangeProp, option, theme])

    return (
      <ChartFrame ref={ref} height={height} className={className} ariaLabel={ariaLabel}>
        <EChart option={mergedOption} />
      </ChartFrame>
    )
  },
)
CalendarHeatmap.displayName = 'CalendarHeatmap'
