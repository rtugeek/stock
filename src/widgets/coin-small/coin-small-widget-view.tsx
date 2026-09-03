import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WidgetWrapper, useWidgetStorage, useWidgetProxyConfig, useWidget } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { CoinApi, Coins, type Coin, type CoinType, type IndexTicker } from '@/api/coin-api'
import { formatNumber } from '@/lib/utils'
import { useStockColorStore } from '@/store/use-stock-color-store'

const PROXY_APPLIED_KEY = 'coin-small-proxy-applied'

function hashProxy(config: { protocol?: string; host?: string; port?: string }): string {
  return `${config.protocol ?? ''}::${config.host ?? ''}::${config.port ?? ''}`
}

const CoinSmallGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

function hexOrRgbToRgba(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    let hex = color.slice(1)
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('')
    }
    if (hex.length === 8) {
      hex = hex.slice(0, 6)
    }
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  const rgb = color.match(/rgba?\(([^)]+)\)/)
  if (rgb) {
    const parts = rgb[1].split(',').map((s) => s.trim()).filter(Boolean)
    const [r, g, b] = parts
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return `rgba(255, 255, 255, ${alpha})`
}

function MiniCoinChart({ data, isUp, color }: { data: number[]; isUp: boolean; color: string }) {
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

    const values = data.length > 0 ? data : Array.from({ length: 48 }, (_, i) => 50 + Math.sin(i / 3) * 5 + Math.random() * 3)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const padTop = 4
    const padBottom = 4
    const chartH = H - padTop - padBottom

    ctx.beginPath()
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * W
      const y = padTop + chartH - ((v - min) / range) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    const grad = ctx.createLinearGradient(0, padTop, 0, H - padBottom)
    grad.addColorStop(0, hexOrRgbToRgba(color, 0.24))
    grad.addColorStop(1, hexOrRgbToRgba(color, 0))
    ctx.lineTo(W, H - padBottom)
    ctx.lineTo(0, H - padBottom)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }, [data, color])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}

function generateCoinChartData(basePrice: number, points = 48): number[] {
  const data: number[] = []
  let val = basePrice
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.48) * (basePrice * 0.006)
    data.push(Number(val.toFixed(4)))
  }
  return data
}

interface CoinTickerState {
  last: string
  rate24h: number
  rateText: string
  isUp: boolean
  color: string
  open24h: string
}

export default function CoinSmallWidgetView() {
  useWidget()
  const [coinType] = useWidgetStorage<CoinType | string>('coin-small-type', 'BTC-USD')
  const [refreshInterval] = useWidgetStorage<string>('coin-small-refresh', '60000')
  const { config: proxyConfig, updateProxy } = useWidgetProxyConfig({ storageKey: 'coin-proxy' })
  const [appliedHash, setAppliedHash] = useWidgetStorage<string>(PROXY_APPLIED_KEY, '')

  const getColorByValue = useStockColorStore((state) => state.getColorByValue)

  useEffect(() => {
    const expected = hashProxy(proxyConfig)
    if (appliedHash === expected) return
    let cancelled = false
    const timer = setTimeout(() => {
      ;(async () => {
        await updateProxy()
        if (!cancelled) {
          setAppliedHash(expected)
          window.location.reload()
        }
      })()
    }, 3000)
    return () => {
      clearTimeout(timer)
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyConfig.protocol, proxyConfig.host, proxyConfig.port])

  const coin = useMemo<Coin>(
    () => Coins.find((c) => c.type === coinType) || Coins[0],
    [coinType]
  )

  const [ticker, setTicker] = useState<CoinTickerState>(() => ({
    last: '--',
    rate24h: 0,
    rateText: '--',
    isUp: true,
    color: '#ffffff',
    open24h: '0',
  }))

  const [chartData, setChartData] = useState<number[]>(() => generateCoinChartData(100))
  const [loading, setLoading] = useState(true)

  const fetchTicker = useCallback(async () => {
    try {
      const t: IndexTicker | null = await CoinApi.getIndexTicker(coinType as string)
      if (!t) return
      const open = Number.parseFloat(t.open24h || t.sodUtc8 || '0')
      const last = Number.parseFloat(t.idxPx || '0')
      const rate = open === 0 ? 0 : ((last - open) / open) * 100
      const isUp = rate >= 0
      const { color } = getColorByValue(isUp)
      setTicker({
        last: t.idxPx,
        rate24h: rate,
        rateText: `${isUp ? '+' : ''}${rate.toFixed(2)}%`,
        isUp,
        color,
        open24h: t.open24h || t.sodUtc8 || '0',
      })
      setChartData((prev) => {
        const nd = [...prev.slice(1)]
        nd.push(last)
        return nd
      })
      setLoading(false)
    }
    catch {
      // ignore
    }
  }, [coinType, getColorByValue])

  useEffect(() => {
    const basePrice = Number.parseFloat(ticker.last) || 100
    setChartData(generateCoinChartData(basePrice))
    setLoading(true)
    fetchTicker()
  }, [coinType]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const intervalMs = Math.max(3000, Number.parseInt(refreshInterval, 10) || 60000)
    const timer = setInterval(fetchTicker, intervalMs)
    return () => clearInterval(timer)
  }, [fetchTicker, refreshInterval])

  return (
    <WidgetWrapper>
      <CoinSmallGlobalStyle />
      <div
        className="w-full h-full flex flex-col gap-1"
        style={{ color: 'var(--widget-color, inherit)' }}
      >
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <img
              src={coin.logo}
              alt={coin.name}
              onError={(e) => {
                const base = (import.meta as any).env?.BASE_URL || '/'
                ;(e.target as HTMLImageElement).src = `${base}coin/bitcoin.png`
              }}
              className="w-6 h-6 rounded-full bg-white shadow-sm flex-shrink-0"
              style={{ width: 26, height: 26, minWidth: 26 }}
            />
            <span className="text-base font-bold leading-tight ml-1">{coin.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div
              className="h-4 px-1 text-[10px] font-bold rounded inline-flex items-center justify-center"
              style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              {coin.ccy || 'USD'}
            </div>
            <span className="ml-auto tabular-nums font-semibold" style={{ color: ticker.color }}>
              {ticker.isUp ? (
                <TrendingUp className="h-3 w-3 inline mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 inline mr-0.5" />
              )}
              {ticker.rateText}
            </span>
          </div>
        </div>
      </div>

      <div
        className="px-4 text-2xl font-light leading-none tabular-nums"
        style={{ color: ticker.color }}
      >
        {loading ? '...' : `$${formatNumber(ticker.last)}`}
      </div>

      <div className="flex-1 px-2 pt-1 pb-3 min-h-0">
        <MiniCoinChart data={chartData} isUp={ticker.isUp} color={ticker.color} />
      </div>
      </div>
    </WidgetWrapper>
  )
}
