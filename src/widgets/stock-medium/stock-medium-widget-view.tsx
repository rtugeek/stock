import { useEffect, useMemo, useRef, useState } from 'react'
import { WidgetWrapper } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatPercent } from '@/lib/utils'

const StockMediumGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

interface StockIndexData {
  code: string
  name: string
  exchange: string
  price: string
  ratio: string
  status: '1' | '-1' | '0'
}

const MOCK_INDEX: StockIndexData[] = [
  {
    code: '000001',
    name: '上证指数',
    exchange: 'SH',
    price: '3128.56',
    ratio: '0.85',
    status: '1',
  },
  {
    code: '399001',
    name: '深证成指',
    exchange: 'SZ',
    price: '9842.31',
    ratio: '-0.42',
    status: '-1',
  },
  {
    code: '399006',
    name: '创业板指',
    exchange: 'SZ',
    price: '1876.24',
    ratio: '1.68',
    status: '1',
  },
]

function generateChartData(basePrice: number, points: number): number[] {
  const data: number[] = []
  let val = basePrice
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.48) * (basePrice * 0.003)
    data.push(Number(val.toFixed(2)))
  }
  return data
}

function MediumLineChart({
  data,
  color,
  timeLabels,
}: {
  data: number[]
  color: string
  timeLabels?: string[]
}) {
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

    const values = data
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const padLeft = 0
    const padRight = 0
    const padTop = 8
    const padBottom = 14
    const chartW = W - padLeft - padRight
    const chartH = H - padTop - padBottom

    ctx.beginPath()
    values.forEach((v, i) => {
      const x = padLeft + (i / (values.length - 1)) * chartW
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
    grad.addColorStop(0, color + '40')
    grad.addColorStop(1, color + '00')
    const lastX = padLeft + chartW
    const lastY = padTop + chartH - ((values[values.length - 1] - min) / range) * chartH
    ctx.lineTo(lastX, H - padBottom)
    ctx.lineTo(padLeft, H - padBottom)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    if (timeLabels && timeLabels.length > 0) {
      ctx.font = '10px sans-serif'
      ctx.fillStyle = 'rgba(120,120,120,0.6)'
      ctx.textAlign = 'center'
      const step = Math.max(1, Math.floor(values.length / 4))
      for (let i = 0; i < values.length; i += step) {
        const x = padLeft + (i / (values.length - 1)) * chartW
        const labelIdx = Math.floor((i / (values.length - 1)) * (timeLabels.length - 1))
        ctx.fillText(timeLabels[labelIdx] || '', x, H - 2)
      }
    }
  }, [data, color, timeLabels])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}

export default function StockMediumWidgetView() {
  const { getColorByValue } = useStockColorStore()
  const [indexData, setIndexData] = useState<StockIndexData[]>(MOCK_INDEX)
  const [selectedCode, setSelectedCode] = useState<string>('000001')
  const [chartDataMap] = useState<Record<string, number[]>>(() => {
    const map: Record<string, number[]> = {}
    MOCK_INDEX.forEach((item) => {
      map[item.code] = generateChartData(Number.parseFloat(item.price), 96)
    })
    return map
  })
  const [chartData, setChartData] = useState<number[]>([])

  const timeLabels = useMemo(() => {
    const labels: string[] = []
    for (let h = 9; h <= 15; h++) {
      if (h === 12) continue
      const mm = h === 9 ? 30 : 0
      labels.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
    }
    return labels
  }, [])

  useEffect(() => {
    const base = Number.parseFloat(indexData.find((d) => d.code === selectedCode)?.price || '3000')
    const existing = chartDataMap[selectedCode]
    if (existing) {
      setChartData(existing)
    } else {
      setChartData(generateChartData(base, 96))
    }
  }, [selectedCode, indexData, chartDataMap])

  useEffect(() => {
    const timer = setInterval(() => {
      setIndexData((prev) =>
        prev.map((item) => {
          const oldPrice = Number.parseFloat(item.price)
          const delta = (Math.random() - 0.5) * (oldPrice * 0.001)
          const newPrice = (oldPrice + delta).toFixed(2)
          const base = selectedCode === item.code && chartData.length > 0
            ? chartData[0]
            : oldPrice * 0.995
          const ratio = (((Number.parseFloat(newPrice) - base) / base) * 100).toFixed(2)
          const status = Number.parseFloat(ratio) >= 0 ? '1' : '-1'
          return {
            ...item,
            price: newPrice,
            ratio,
            status: status as StockIndexData['status'],
          }
        })
      )
    }, 4000)
    return () => clearInterval(timer)
  }, [selectedCode, chartData])

  const selectedStock = indexData.find((d) => d.code === selectedCode) || indexData[0]
  const ratio = Number.parseFloat(selectedStock.ratio)
  const isUp = ratio >= 0
  const { color } = getColorByValue(ratio)

  return (
    <WidgetWrapper>
      <StockMediumGlobalStyle />
      <div
        className="w-full h-full flex flex-col p-3 gap-2"
        style={{ color: 'var(--widget-color, inherit)' }}
      >
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        {indexData.map((stock) => {
          const sRatio = Number.parseFloat(stock.ratio)
          const sIsUp = sRatio >= 0
          const sColor = getColorByValue(sRatio).color
          const isSelected = stock.code === selectedCode
          return (
            <button
              key={stock.code}
              onClick={() => setSelectedCode(stock.code)}
              className={
                'flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md transition-colors ' +
                (isSelected ? 'bg-accent/50' : 'hover:bg-accent/30')
              }
            >
              <div className="flex flex-col gap-0.5 items-start" style={{ width: 150 }}>
                <span className="text-base font-bold leading-tight">{stock.name}</span>
                <div className="flex items-center gap-1 text-xs opacity-80">
                  <Badge
                    variant="outline"
                    className="h-4 px-1 text-[10px] font-mono border-opacity-50"
                  >
                    {stock.exchange}
                  </Badge>
                  <span className="font-mono opacity-70">{stock.code}</span>
                </div>
              </div>
              <span className="ml-auto tabular-nums font-semibold text-sm">
                {formatNumber(stock.price)}
              </span>
              <span
                className="tabular-nums text-xs font-semibold h-6 min-w-16 flex items-center justify-center rounded px-2"
                style={{
                  backgroundColor: sColor + '1A',
                  color: sColor,
                }}
              >
                {stock.status === '1' ? '+' : ''}
                {formatPercent(stock.ratio)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="h-28 border-t pt-2 mt-1">
        <div className="flex items-center justify-between text-xs mb-1 opacity-70 px-1">
          <span className="font-semibold">{selectedStock.name} 分时</span>
          <span style={{ color }} className="tabular-nums">
            {isUp ? '↑' : '↓'} {formatPercent(selectedStock.ratio)}
          </span>
        </div>
        <div className="h-20 w-full">
          <MediumLineChart data={chartData} color={color} timeLabels={timeLabels} />
        </div>
      </div>
      </div>
    </WidgetWrapper>
  )
}
