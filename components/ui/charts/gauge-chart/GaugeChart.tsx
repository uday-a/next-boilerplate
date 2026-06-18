'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react/lib/core'
import { cn } from '@/lib/utils'
import { ChartFrame, EChart, echartsCoreModule, heightToStyle } from '../shared'
import { useChartTheme, mergeOptionBlock, toRgba, gaugeThresholds } from '../useChartTheme'

// GaugeChart
// ─────────────────────────────────────────────────────────────────────────

export interface GaugeChartProps {
  value: number
  min?: number
  max?: number
  unit?: string
  label?: string
  height?: number | string
  /** Colour stops as [percentage, hex] pairs. Default: teal->amber->red,
   *  pulled from `gaugeThresholds` in useChartTheme so the safe-zone
   *  colour ties back to the dashboard palette. Pass your own to override. */
  thresholds?: [number, string][]
  option?: any
  className?: string
}

export const GaugeChart = React.forwardRef<HTMLDivElement, GaugeChartProps>(
  (
    { value, min = 0, max = 100, unit = '', label, height = 220, thresholds = gaugeThresholds, option, className },
    ref,
  ) => {
    const theme = useChartTheme()

    const mergedOption = React.useMemo(() => {
      const series = [
        {
          type: 'gauge',
          min,
          max,
          center: ['50%', '60%'],
          radius: '85%',
          startAngle: 200,
          endAngle: -20,
          progress: { show: true, width: 14 },
          pointer: { show: true, length: '55%', width: 4 },
          axisLine: {
            lineStyle: {
              width: 14,
              color: thresholds.map(([stop, color]) => [stop, color] as [number, string]),
            },
          },
          axisTick: { distance: -22, length: 4, lineStyle: { color: theme.textColor, width: 1 } },
          splitLine: { distance: -26, length: 8, lineStyle: { color: theme.textColor, width: 2 } },
          axisLabel: { color: theme.textColor, fontSize: 10, distance: -34 },
          anchor: { show: false },
          title: {
            offsetCenter: [0, '88%'],
            color: theme.textColor,
            fontSize: 11,
            fontWeight: 500,
          },
          detail: {
            valueAnimation: true,
            formatter: `{value}${unit ? ' ' + unit : ''}`,
            color: theme.colors[0],
            fontSize: 28,
            fontWeight: 700,
            offsetCenter: [0, '40%'],
          },
          data: [{ value, name: label ?? '' }],
        },
      ]

      const userOption: any = option ?? {}
      const { series: userSeries, ...userRest } = userOption
      const mergedSeries = Array.isArray(userSeries) ? series.map((s, i) => ({ ...s, ...(userSeries[i] ?? {}) })) : series

      return {
        tooltip: {
          formatter: '{b}: {c}' + (unit ? ` ${unit}` : ''),
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          textStyle: { color: theme.tooltipText, fontSize: 12 },
        },
        series: mergedSeries,
        ...userRest,
      }
    }, [value, min, max, unit, label, thresholds, option, theme])

    return (
      <ChartFrame ref={ref} height={height} className={className}>
        <EChart option={mergedOption} />
      </ChartFrame>
    )
  },
)
GaugeChart.displayName = 'GaugeChart'
