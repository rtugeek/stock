import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WidgetWrapper, useWidgetStorage, useWidget } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import Color from 'color'
import { ExchangeTag } from '@/components/exchange-tag'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { EastMoneyStockApi, type EmMinuteRaw } from '@/api/eastmoney-stock-api'
import { useInterval } from '@/hooks/use-interval'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn, formatPercent } from '@/lib/utils'

const StockSmallGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

interface QuotationMinuteData {
  times: string[]
  data: number[]
}

function SmallLineChart({ data, isUp, color }: { data: QuotationMinuteData; isUp: boolean; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height
    ctx.clearRect(0, 0, W, H)

    const values = data.data.length > 0 ? data.data : Array.from({ length: 48 }, () => 50 + Math.random() * 10 - 5)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const padX = 0
    const padTop = 4
    const padBottom = 4
    const chartH = H - padTop - padBottom

    ctx.beginPath()
    values.forEach((v, i) => {
      const x = padX + (i / (values.length - 1)) * (W - padX * 2)
      const y = padTop + chartH - ((v - min) / range) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    const lastX = W
    const lastY = padTop + chartH - ((values[values.length - 1] - min) / range) * chartH
    const grad = ctx.createLinearGradient(0, padTop, 0, H - padBottom)
    grad.addColorStop(0, Color(color).alpha(0.3).string())
    grad.addColorStop(1, Color(color).alpha(0).string())
    ctx.lineTo(lastX, H - padBottom)
    ctx.lineTo(padX, H - padBottom)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }, [data, color])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
}

function emMarketToExchangeCode(market: number): string {
  if (market === 1) return 'sh'
  if (market === 0) return 'sz'
  if (market === 116) return 'hk'
  if (market === 105 || market === 106 || market === 107) return 'nasdaq'
  if (market === 113 || market === 114) return 'nyse'
  if (market === 155 || market === 156 || market === 157) return 'us'
  return 'us'
}

function parseNumberSafe(v: string | number | undefined | null, fallback = 0): number {
  if (v === undefined || v === null || v === '') return fallback
  const n = Number.parseFloat(String(v))
  return Number.isNaN(n) ? fallback : n
}

export default function StockSmallWidgetView() {
  useWidget()
  const { getColorByValue } = useStockColorStore()
  const [stockCode] = useWidgetStorage<string>('stock-small-code', '01810')
  const [refreshInterval] = useWidgetStorage<string>('stock-small-refresh', '60000')

  const [quotation, setQuotation] = useState<EmMinuteRaw | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await EastMoneyStockApi.getRawMinuteTrends(stockCode)
      if (data) setQuotation(data)
    } finally {
      setLoading(false)
    }
  }, [stockCode])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useInterval(() => {
    void refresh()
  }, Number.parseInt(refreshInterval || '60000', 10))

  const decimal = Math.min(quotation?.decimal ?? 2, 2)
  const preClose = quotation?.preClose ?? 0

  const { lastPrice, ratio, change } = useMemo(() => {
    if (!quotation?.trends || quotation.trends.length === 0) {
      return { lastPrice: 0, ratio: 0, change: 0 }
    }
    const lastRow = quotation.trends[quotation.trends.length - 1]
    const parts = lastRow.split(',')
    const close = parseNumberSafe(parts[2])
    const diff = preClose === 0 ? 0 : close - preClose
    const r = preClose === 0 ? 0 : (diff / preClose) * 100
    return { lastPrice: close, ratio: r, change: diff }
  }, [quotation, preClose])

  const chartData = useMemo<QuotationMinuteData>(() => {
    if (!quotation?.trends || quotation.trends.length === 0) {
      return { times: [], data: [] }
    }
    const times: string[] = []
    const data: number[] = []
    for (const row of quotation.trends) {
      const parts = row.split(',')
      const t = parts[0]
      const p = parseNumberSafe(parts[2], NaN)
      if (!Number.isNaN(p)) {
        times.push(t)
        data.push(p)
      }
    }
    return { times, data }
  }, [quotation])

  const ratioNum = ratio
  const isUp = ratioNum >= 0
  const { color } = getColorByValue(ratioNum)

  const exchangeCode = useMemo(() => {
    if (!quotation) return ''
    return emMarketToExchangeCode(quotation.market)
  }, [quotation])

  const displayName = quotation?.name ?? (loading ? '加载中...' : '暂无数据')
  const displayPrice = quotation
    ? lastPrice.toFixed(decimal)
    : loading
      ? '--'
      : '0'
  const ratioDisplay = `${ratioNum >= 0 ? '+' : ''}${ratioNum.toFixed(2)}%`

  return (
    <WidgetWrapper>
      <StockSmallGlobalStyle />
      <div
        className="w-full h-full flex flex-col"
        style={{ color: 'var(--widget-color, inherit)' }}
      >
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-col gap-2">
          <div className="text-base font-bold leading-tight">
            {displayName}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ExchangeTag
              exchange={exchangeCode}
              size="xs"
              className="h-3.5"
            />
            <span className="font-mono opacity-60">{stockCode}</span>
            <span
              className={cn('ml-auto tabular-nums font-semibold flex items-center')}
              style={{ color }}
            >
              {ratioNum > 0 ? (
                <TrendingUp className="h-3 w-3 inline mr-0.5" />
              ) : ratioNum < 0 ? (
                <TrendingDown className="h-3 w-3 inline mr-0.5" />
              ) : null}
              {quotation
                ? ratioDisplay
                : loading
                  ? '加载中'
                  : formatPercent('0')}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 text-3xl font-light leading-none tabular-nums">
        {displayPrice}
      </div>

      <div className="flex-1 px-2 pt-2 pb-3 min-h-0">
        <SmallLineChart data={chartData} isUp={isUp} color={color} />
      </div>
      </div>
    </WidgetWrapper>
  )
}
