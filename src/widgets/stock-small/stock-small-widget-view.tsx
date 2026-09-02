import { useEffect, useMemo, useRef, useState } from 'react'
import { WidgetWrapper } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn, formatNumber, formatPercent } from '@/lib/utils'
import type { StockType } from '@/api/bai-du-stock-api'

const StockSmallGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

interface StockQuotation {
  basicinfos: {
    name: string
    exchange: string
  }
  cur: {
    price: string
    ratio: string
    increase: string
  }
  financeType?: string
}

const MOCK_QUOTATION: Record<string, StockQuotation> = {
  '01810': {
    basicinfos: { name: '小米集团-W', exchange: 'HK' },
    cur: { price: '18.56', ratio: '1.87', increase: '0.34' },
  },
  AAPL: {
    basicinfos: { name: 'Apple', exchange: 'NSD' },
    cur: { price: '189.84', ratio: '1.23', increase: '2.31' },
  },
  '00700': {
    basicinfos: { name: '腾讯控股', exchange: 'HK' },
    cur: { price: '382.40', ratio: '-2.10', increase: '-8.20' },
  },
}

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
    grad.addColorStop(0, color + '4D')
    grad.addColorStop(1, color + '00')
    ctx.lineTo(lastX, H - padBottom)
    ctx.lineTo(padX, H - padBottom)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }, [data, color])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
}

export default function StockSmallWidgetView() {
  const { getColorByValue } = useStockColorStore()
  const [stockCode] = useState<string>('01810')
  const [stockType] = useState<StockType>('stock')
  const [quotation, setQuotation] = useState<StockQuotation | null>(null)
  const [chartData] = useState<QuotationMinuteData>(() => {
    const base = Number.parseFloat(MOCK_QUOTATION['01810'].cur.price)
    const points = 48
    const times: string[] = []
    const data: number[] = []
    let val = base
    for (let i = 0; i < points; i++) {
      const h = 9 + Math.floor((i * 4) / points)
      const m = ((i * 4) % points) * (60 / points)
      times.push(`${String(h).padStart(2, '0')}:${String(Math.floor(m)).padStart(2, '0')}`)
      val += (Math.random() - 0.48) * 0.15
      data.push(Number(val.toFixed(2)))
    }
    return { times, data }
  })

  useEffect(() => {
    const mock = MOCK_QUOTATION[stockCode] || MOCK_QUOTATION['01810']
    setQuotation(mock)
    const timer = setInterval(() => {
      setQuotation((prev) => {
        if (!prev) return mock
        const delta = (Math.random() - 0.5) * 0.1
        const newPrice = (Number.parseFloat(prev.cur.price) + delta).toFixed(2)
        const base = 18.22
        const newRatio = (((Number.parseFloat(newPrice) - base) / base) * 100).toFixed(2)
        return {
          ...prev,
          cur: {
            ...prev.cur,
            price: newPrice,
            ratio: newRatio,
          },
        }
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [stockCode])

  const ratio = useMemo(() => Number.parseFloat(quotation?.cur.ratio ?? '0'), [quotation])
  const isUp = ratio >= 0
  const { color } = getColorByValue(ratio)

  const exchangeTag = useMemo(() => {
    const ex = quotation?.basicinfos?.exchange
    if (!ex || ex === '') {
      if (quotation?.financeType === 'block') return 'BK'
      return 'err'
    }
    return ex
  }, [quotation])

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
            {quotation?.basicinfos?.name ?? '加载中...'}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Badge
              variant="outline"
              className="h-4 px-1.5 text-[10px] font-mono border-opacity-60"
            >
              {exchangeTag}
            </Badge>
            <span className="font-mono opacity-60">{stockCode}</span>
            <span
              className={cn('ml-auto tabular-nums font-semibold', isUp ? '' : '')}
              style={{ color }}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3 inline mr-0.5" />
              ) : ratio < 0 ? (
                <TrendingDown className="h-3 w-3 inline mr-0.5" />
              ) : null}
              {formatPercent(quotation?.cur.ratio ?? '0')}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 text-3xl font-light leading-none tabular-nums">
        {quotation?.cur?.price ?? '0'}
      </div>

      <div className="flex-1 px-2 pt-2 pb-3 min-h-0">
        <SmallLineChart data={chartData} isUp={isUp} color={color} />
      </div>
      </div>
    </WidgetWrapper>
  )
}
