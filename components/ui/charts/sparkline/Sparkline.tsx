'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react/lib/core'
import { cn } from '@/lib/utils'
import { ChartFrame, EChart, echartsCoreModule, heightToStyle } from '../shared'
import { useChartTheme, mergeOptionBlock, toRgba, gaugeThresholds } from '../useChartTheme'

// Sparkline
// ─────────────────────────────────────────────────────────────────────────

export type SparklineVariant = 'area' | 'bars' | 'line' | 'dots'

export interface SparklineProps {
  data: number[]
  color?: string
  height?: number | string
  /** Mini form per KPI so every card reads distinct: area fill, bars,
   *  plain line, or line with sample dots. */
  variant?: SparklineVariant
  option?: any
  className?: string
  /** Descriptive label for the `role="img"` frame. */
  ariaLabel?: string
}

export const Sparkline = React.forwardRef<HTMLDivElement, SparklineProps>(
  ({ data, color: colorProp, height = 40, variant = 'area', option, className, ariaLabel }, ref) => {
    const theme = useChartTheme()
    const color = colorProp ?? theme.colors[1]

    const mergedOption = React.useMemo(() => {
      const bars = {
        type: 'bar',
        barWidth: '60%',
        itemStyle: { color, borderRadius: [2, 2, 0, 0] },
        data,
      }
      const line: any = {
        type: 'line',
        smooth: true,
        // Dots variant marks every sample; area keeps the original
        // last-point dot; plain line stays clean.
        symbol: variant === 'dots' ? 'circle' : 'none',
        symbolSize: variant === 'dots' ? 5 : 0,
        showSymbol: variant === 'dots',
        lineStyle: { width: variant === 'area' ? 1.75 : 2, color },
        itemStyle: { color, borderColor: color, borderWidth: 0 },
        data:
          variant === 'area'
            ? data.map((v, i) => ({
              value: v,
              symbol: i === data.length - 1 ? 'circle' : 'none',
              symbolSize: i === data.length - 1 ? 5 : 0,
            }))
            : data,
      }
      if (variant === 'area') {
        // WHY: flat area fill at low opacity -- no linear-gradient
        // wash. Gradients read as decoration, not data.
        line.areaStyle = { opacity: 0.12, color }
      }
      const series = [variant === 'bars' ? bars : line]

      const userOption: any = option ?? {}
      const { series: userSeries, ...userRest } = userOption
      const mergedSeries = Array.isArray(userSeries) ? series.map((s, i) => ({ ...s, ...(userSeries[i] ?? {}) })) : series

      return {
        grid: { left: 0, right: 0, top: 2, bottom: 2 },
        xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
        // WHY: zero-based so a small trend can't read as a cliff.
        // Sparklines show shape; the zero base keeps them honest.
        yAxis: { type: 'value', show: false, min: 0 },
        tooltip: { show: false },
        series: mergedSeries,
        ...userRest,
      }
    }, [data, color, option, variant])

    return (
      <ChartFrame ref={ref} height={height} className={className} ariaLabel={ariaLabel}>
        <EChart option={mergedOption} />
      </ChartFrame>
    )
  },
)
Sparkline.displayName = 'Sparkline'
