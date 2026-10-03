'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react/lib/core'
import { cn } from '@/lib/utils'
import { ChartFrame, EChart, echartsCoreModule, heightToStyle } from '../shared'
import { useChartTheme, mergeOptionBlock, toRgba, gaugeThresholds } from '../useChartTheme'

// BarChart
// ─────────────────────────────────────────────────────────────────────────

export interface BarChartProps {
  data: Record<string, any>[]
  xField?: string
  yField?: string | string[]
  height?: number | string
  /** Unit appended to tooltip values, e.g. 'requests'. */
  unit?: string
  option?: any
  className?: string
  /** Descriptive label for the `role="img"` frame. */
  ariaLabel?: string
}

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  ({ data, xField = 'x', yField = 'y', height = 300, unit = '', option, className, ariaLabel }, ref) => {
    const theme = useChartTheme()

    const mergedOption = React.useMemo(() => {
      const fields = Array.isArray(yField) ? yField : [yField]
      const xData = data.map((d) => d[xField])

      const series = fields.map((field, i) => ({
        name: fields.length > 1 ? field : '',
        type: 'bar',
        barMaxWidth: 32,
        itemStyle: { color: theme.colors[i % theme.colors.length] },
        data: data.map((d) => d[field]),
      }))

      const userOption: any = option ?? {}
      const {
        series: userSeries,
        xAxis: userXAxis,
        yAxis: userYAxis,
        grid: userGrid,
        tooltip: userTooltip,
        legend: userLegend,
        ...userRest
      } = userOption
      const mergedSeries = Array.isArray(userSeries) ? series.map((s, i) => ({ ...s, ...(userSeries[i] ?? {}) })) : series

      const baseLegend: any =
        fields.length > 1
          ? {
              bottom: 0,
              icon: 'circle',
              itemWidth: 8,
              itemHeight: 8,
              textStyle: { fontSize: 12, color: theme.textColor },
            }
          : { show: false }

      return {
        color: theme.colors,
        grid: mergeOptionBlock(
          { left: 16, right: 16, top: 24, bottom: fields.length > 1 ? 32 : 24, containLabel: true },
          userGrid,
        ),
        tooltip: mergeOptionBlock(
          {
            trigger: 'axis',
            backgroundColor: theme.tooltipBg,
            borderColor: theme.tooltipBorder,
            textStyle: { color: theme.tooltipText, fontSize: 12 },
            // WHY: series with known units format through here so the
            // default tooltip never shows a bare number.
            valueFormatter: (v: number) => `${Number(v).toLocaleString()}${unit ? ` ${unit}` : ''}`,
          },
          userTooltip,
        ),
        legend: userLegend?.show === false ? undefined : mergeOptionBlock(baseLegend, userLegend),
        xAxis: mergeOptionBlock(
          {
            type: 'category',
            data: xData,
            axisLine: { lineStyle: { color: theme.axisColor } },
            axisLabel: { color: theme.textColor, fontSize: 12 },
            axisTick: { show: false },
          },
          userXAxis,
        ),
        yAxis: mergeOptionBlock(
          {
            type: 'value',
            // WHY: bars encode value as length from zero -- a truncated
            // baseline turns small deltas into cliffs. Always zero-based.
            min: 0,
            splitLine: { lineStyle: { color: theme.splitLineColor } },
            axisLabel: { color: theme.textColor, fontSize: 12 },
            axisLine: { show: false },
            axisTick: { show: false },
          },
          userYAxis,
        ),
        series: mergedSeries,
        ...userRest,
      }
    }, [data, xField, yField, unit, option, theme])

    return (
      <ChartFrame ref={ref} height={height} className={className} ariaLabel={ariaLabel}>
        <EChart option={mergedOption} />
      </ChartFrame>
    )
  },
)
BarChart.displayName = 'BarChart'
