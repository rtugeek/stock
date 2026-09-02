import { useEffect, useMemo, useRef, useState } from 'react'
import { WidgetWrapper } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Coins, type Coin, type CoinType, type OkxWebSocketEventData } from '@/api/coin-api'
import { formatNumber, formatPercent } from '@/lib/utils'

const CoinSmallGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

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
    grad.addColorStop(0, color + '3D')
    grad.addColorStop(1, color + '00')
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
  const [coinType] = useState<CoinType | string>('BTC-USD')

  const coin = useMemo<Coin>(
    () => Coins.find((c) => c.type === coinType) || Coins[0],
    [coinType]
  )

  const [ticker, setTicker] = useState<CoinTickerState>(() => ({
    last: '68250.25',
    rate24h: 2.45,
    rateText: '+2.45%',
    isUp: true,
    color: '#22c55e',
    open24h: '66610.00',
  }))

  const [chartData, setChartData] = useState<number[]>(() => generateCoinChartData(68000))
  const [loading] = useState(false)

  useEffect(() => {
    const basePrice = coinType === 'BTC-USD' ? 68000 : coinType === 'ETH-USD' ? 3500 : coinType === 'SOL-USD' ? 140 : 500
    setChartData(generateCoinChartData(basePrice))
  }, [coinType])

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => {
        const current = Number.parseFloat(prev.last)
        const delta = (Math.random() - 0.5) * (current * 0.0015)
        const newLast = (current + delta).toFixed(2)
        const open = Number.parseFloat(prev.open24h)
        const rate = ((Number.parseFloat(newLast) - open) / open) * 100
        const isUp = rate >= 0
        return {
          ...prev,
          last: newLast,
          rate24h: rate,
          rateText: `${isUp ? '+' : ''}${rate.toFixed(2)}%`,
          isUp,
          color: isUp ? '#22c55e' : '#ef4444',
        }
      })
      setChartData((prev) => {
        const newData = [...prev.slice(1)]
        const last = prev[prev.length - 1]
        newData.push(Number((last + (Math.random() - 0.48) * (last * 0.004)).toFixed(4)))
        return newData
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [])

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
            <Badge
              variant="outline"
              className="h-4 px-1.5 text-[10px] font-mono border-opacity-60"
            >
              USD
            </Badge>
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
