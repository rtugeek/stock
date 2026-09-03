import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import Color from 'color'
import type { EChartsType } from 'echarts'
import { EastMoneyStockApi } from '@/api/eastmoney-stock-api'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { cn } from '@/lib/utils'

interface StockChartProps {
  code: string
  height?: number
  refreshInterval?: number
  className?: string
}

export function StockChart({ code, height = 40, refreshInterval, className }: StockChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<EChartsType | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { getColorByValue, stockColor } = useStockColorStore()
  const [seriesData, setSeriesData] = useState<(string | number)[]>([])
  const [isUp, setIsUp] = useState(false)

  const getColor = React.useCallback((up: boolean) => {
    const { color, colorEnd } = getColorByValue(up ? 1 : -1)
    return {
      color,
      colorEnd: Color(color).alpha(0).string(),
    }
  }, [getColorByValue])

  const initChart = React.useCallback(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    chart.setOption({
      title: { show: false },
      tooltip: { show: false },
      grid: {
        top: 0,
        bottom: 0,
        height: `${height}`,
      },
      yAxis: {
        type: 'value',
        min: 'dataMin',
        max: 'dataMax',
        splitLine: { show: false },
        show: false,
      },
      xAxis: {
        show: false,
        type: 'category',
      },
      series: [
        {
          name: '价格',
          type: 'line',
          showSymbol: false,
          lineStyle: { width: 1 },
          data: [],
          markLine: {
            symbol: 'none',
            label: { show: false },
            tooltip: { show: false },
            lineStyle: {
              type: [2, 2] as unknown as string,
              dashOffset: 5,
              width: 1,
            },
            emphasis: { disabled: true },
            data: [],
          },
        },
      ],
    })

    chartInstanceRef.current = chart

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [height])

  const updateChart = React.useCallback((data: (string | number)[], up: boolean) => {
    if (!chartInstanceRef.current || data.length === 0) return

    const { color, colorEnd } = getColor(up)
    const markLineValue = data[data.length - 1] ?? 0

    chartInstanceRef.current.setOption({
      series: [
        {
          name: '价格',
          type: 'line',
          data: data,
          itemStyle: { color },
          markLine: {
            lineStyle: { color },
            data: [{ yAxis: markLineValue }],
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color },
              { offset: 1, color: colorEnd },
            ]),
          },
        },
      ],
    })
  }, [getColor])

  const fetchData = React.useCallback(async () => {
    try {
      const result = await EastMoneyStockApi.getQuotationMinute(code)
      const marketData = result.newMarketData.marketData
      if (marketData && marketData.length > 0) {
        const prices: (string | number)[] = []
        for (const row of marketData) {
          const parts = row.p.split(',')
          if (parts[1]) prices.push(parts[1])
        }
        if (prices.length > 0) {
          const increase = Number.parseFloat(result.cur.increase)
          const up = increase >= 0
          setSeriesData(prices)
          setIsUp(up)
          updateChart(prices, up)
        }
      }
    }
    catch (e) {
      // ignore
    }
  }, [code, updateChart])

  useEffect(() => {
    const cleanup = initChart()
    fetchData()

    const interval = refreshInterval ?? 60000
    timerRef.current = setInterval(fetchData, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      cleanup?.()
    }
  }, [initChart, fetchData, refreshInterval])

  useEffect(() => {
    if (seriesData.length > 0) {
      updateChart(seriesData, isUp)
    }
  }, [stockColor, seriesData, isUp, updateChart])

  return (
    <div
      ref={chartRef}
      className={cn('chart', className)}
      style={{ width: 60, height }}
    />
  )
}
