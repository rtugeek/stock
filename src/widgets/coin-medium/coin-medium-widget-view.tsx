import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Coins, type OkxWebSocketEventData } from '@/api/coin-api'
import { formatNumber } from '@/lib/utils'

interface CoinLiveData extends OkxWebSocketEventData {
  rate24h: number
  rateText: string
  isUp: boolean
  color: string
}

const MOCK_INITIAL: Record<string, { last: string; open: string; high: string; low: string }> = {
  BTC: { last: '68250.25', open: '66610.00', high: '69100.00', low: '65980.00' },
  ETH: { last: '3520.40', open: '3457.20', high: '3580.00', low: '3420.50' },
  SOL: { last: '148.65', open: '149.62', high: '152.30', low: '145.20' },
  BNB: { last: '598.30', open: '592.85', high: '605.00', low: '588.40' },
  XRP: { last: '0.5234', open: '0.5300', high: '0.5380', low: '0.5180' },
  DOGE: { last: '0.1245', open: '0.1200', high: '0.1280', low: '0.1175' },
  TRX: { last: '0.1382', open: '0.1360', high: '0.1410', low: '0.1345' },
  OKB: { last: '52.40', open: '51.80', high: '53.20', low: '51.20' },
}

function MediumCoinChart({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.style.height = `${height}px`
    canvas.height = height * dpr
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = height
    ctx.clearRect(0, 0, W, H)

    const values = data.length > 0 ? data : Array.from({ length: 32 }, () => 50 + Math.random() * 10 - 5)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    ctx.beginPath()
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * W
      const y = H - 2 - ((v - min) / range) * (H - 4)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, color + '2D')
    grad.addColorStop(1, color + '00')
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }, [data, color, height])

  return <canvas ref={canvasRef} className="w-full block" />
}

function buildChartData(basePrice: number, isUp: boolean, points = 32): number[] {
  const data: number[] = []
  let val = basePrice * (isUp ? 0.99 : 1.01)
  const drift = isUp ? basePrice * 0.0008 : -basePrice * 0.0008
  for (let i = 0; i < points; i++) {
    val += drift + (Math.random() - 0.5) * (basePrice * 0.003)
    data.push(Number(val.toFixed(4)))
  }
  return data
}

export default function CoinMediumWidgetView() {
  const [liveData, setLiveData] = useState<Record<string, CoinLiveData>>(() => {
    const result: Record<string, CoinLiveData> = {}
    Coins.forEach((coin) => {
      if (coin.ccy) {
        const mock = MOCK_INITIAL[coin.ccy] || MOCK_INITIAL.BTC
        const open = Number(mock.open)
        const last = Number(mock.last)
        const rate = ((last - open) / open) * 100
        const isUp = rate >= 0
        result[coin.ccy] = {
          ccy: coin.ccy,
          last: mock.last,
          open24h: mock.open,
          high24h: mock.high,
          low24h: mock.low,
          sodUtc0: mock.open,
          sodUtc8: mock.open,
          ts: Date.now().toString(),
          rate24h: rate,
          rateText: `${isUp ? '+' : ''}${rate.toFixed(2)}%`,
          isUp,
          color: isUp ? '#22c55e' : '#ef4444',
        }
      }
    })
    return result
  })

  const chartMap = useMemo(() => {
    const map: Record<string, number[]> = {}
    Coins.forEach((coin) => {
      if (coin.ccy && liveData[coin.ccy]) {
        const d = liveData[coin.ccy]
        map[coin.ccy] = buildChartData(Number(d.last), d.isUp)
      }
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveData((prev) => {
        const next: Record<string, CoinLiveData> = {}
        Object.keys(prev).forEach((ccy) => {
          const item = prev[ccy]
          const current = Number(item.last)
          const delta = (Math.random() - 0.5) * (current * 0.001)
          const newLast = (current + delta).toFixed(ccy === 'XRP' || ccy === 'DOGE' || ccy === 'TRX' ? 4 : 2)
          const open = Number(item.open24h)
          const rate = ((Number(newLast) - open) / open) * 100
          const isUp = rate >= 0
          next[ccy] = {
            ...item,
            last: newLast,
            ts: Date.now().toString(),
            rate24h: rate,
            rateText: `${isUp ? '+' : ''}${rate.toFixed(2)}%`,
            isUp,
            color: isUp ? '#22c55e' : '#ef4444',
            high24h: Number(item.high24h) > Number(newLast) ? item.high24h : newLast,
            low24h: Number(item.low24h) < Number(newLast) ? item.low24h : newLast,
          }
        })
        return next
      })
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{ color: 'var(--widget-color, inherit)' }}
    >
      <div className="flex flex-col gap-3 p-3">
        {Coins.map((coin) => {
          const ccy = coin.ccy || 'BTC'
          const data = liveData[ccy]
          const chartData = chartMap[ccy] || []
          return (
            <Card
              key={coin.type}
              className="overflow-hidden border-opacity-60 hover:border-opacity-100 transition-all"
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex gap-2 items-center" style={{ width: 150 }}>
                    <img
                      src={coin.logo}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full bg-white shadow-sm flex-shrink-0"
                      onError={(e) => {
                        const base = (import.meta as any).env?.BASE_URL || '/'
                        const fallback = coin.ccy ? `${base}coin/${coin.ccy.toLowerCase()}.png` : `${base}coin/bitcoin.png`
                        ;(e.target as HTMLImageElement).src = fallback
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold leading-tight truncate">{ccy}</span>
                      <span className="text-xs opacity-60 truncate">{coin.name}</span>
                    </div>
                  </div>
                  <span className="ml-auto text-sm font-semibold tabular-nums whitespace-nowrap">
                    ${data ? formatNumber(data.last) : '--'}
                  </span>
                  <div className="w-20 h-8 ml-2 flex-shrink-0">
                    {data && <MediumCoinChart data={chartData} color={data.color} height={28} />}
                  </div>
                  {data && (
                    <span
                      className="text-xs font-semibold h-6 min-w-16 max-w-16 flex items-center justify-center rounded tabular-nums flex-shrink-0"
                      style={{
                        backgroundColor: data.color + '1A',
                        color: data.color,
                      }}
                    >
                      {data.rateText}
                    </span>
                  )}
                </div>
                {data && (
                  <div className="mt-2 pt-2 border-t flex justify-between text-[10px] opacity-60 tabular-nums">
                    <span>
                      24H 高: <span style={{ color: '#22c55e' }}>${formatNumber(data.high24h)}</span>
                    </span>
                    <span>
                      24H 低: <span style={{ color: '#ef4444' }}>${formatNumber(data.low24h)}</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
