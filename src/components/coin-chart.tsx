import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import Color from 'color'
import type { EChartsType } from 'echarts'
import { CoinApi, type Coin } from '@/api/coin-api'
import { cn } from '@/lib/utils'

const UP_COLOR = 'rgb(95,194,93)'
const DOWN_COLOR = '#f82842'

interface CoinChartProps {
  coin: Coin
  height?: number
  refreshInterval?: number
  className?: string
}

export function CoinChart({ coin, height = 40, refreshInterval, className }: CoinChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<EChartsType | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [seriesData, setSeriesData] = useState<(string | number)[]>([])
  const [isUp, setIsUp] = useState(false)

  const getColor = (up: boolean) => {
    const color = up ? UP_COLOR : DOWN_COLOR
    return {
      color,
      colorEnd: Color(color).alpha(0).string(),
    }
  }

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
  }, [])

  const fetchData = React.useCallback(async () => {
    try {
      let prices: (string | number)[] = []
      let up = false

      try {
        const tickerData = await CoinApi.getIndexTickers(coin)
        if (tickerData && tickerData.length > 0) {
          prices = tickerData.map((row) => row[1])
          const first = Number.parseFloat(String(tickerData[0]?.[1] ?? '0'))
          const last = Number.parseFloat(String(tickerData[tickerData.length - 1]?.[1] ?? '0'))
          up = last >= first
        }
      }
      catch {
        const candles = await CoinApi.getCandlesHistory(coin.type as any)
        if (candles && candles.length > 0) {
          prices = candles.map((c) => c.c)
          const first = Number.parseFloat(candles[0]?.o ?? '0')
          const last = Number.parseFloat(candles[candles.length - 1]?.c ?? '0')
          up = last >= first
        }
      }

      if (prices.length > 0) {
        setSeriesData(prices)
        setIsUp(up)
        updateChart(prices, up)
      }
    }
    catch (e) {
      // ignore
    }
  }, [coin, updateChart])

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

  return (
    <div
      ref={chartRef}
      className={cn('chart', className)}
      style={{ width: 60, height }}
    />
  )
}
