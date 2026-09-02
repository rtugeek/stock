import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface GoldChartHandle {
  update: (seriesData: (string | number)[], currentPrice: number) => void
}

export interface GoldChartProps {
  id?: string
  height?: number
  className?: string
}

const GoldChart = forwardRef<GoldChartHandle, GoldChartProps>(function GoldChart(
  { id = 'gold-chart', height = 40, className },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartDataRef = useRef<{ data: (string | number)[]; currentPrice: number }>({
    data: [],
    currentPrice: 0,
  })

  useImperativeHandle(ref, () => ({
    update: (seriesData: (string | number)[], currentPrice: number) => {
      chartDataRef.current = { data: seriesData, currentPrice }
      drawChart()
    },
  }))

  const drawChart = () => {
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

    const lineColor = '#ffc85b'
    const alphaColor = 'rgba(255,200,91,0.66)'

    const { data, currentPrice } = chartDataRef.current
    const values = data.map((value) => Number(value)).filter(Number.isFinite)
    if (values.length === 0) return

    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const priceMax = Math.max(max, currentPrice || max)
    const priceMin = Math.min(min, currentPrice || min)
    const priceRange = Math.max(range, priceMax - priceMin || 1)

    const padTop = 4
    const padBottom = 4
    const padLeft = 0
    const padRight = 0
    const chartH = H - padTop - padBottom
    const chartW = W - padLeft - padRight

    const getY = (v: number) => {
      return padTop + chartH - ((v - priceMin) / priceRange) * chartH
    }

    ctx.beginPath()
    values.forEach((v, i) => {
      const x = padLeft + (i / (values.length - 1)) * chartW
      const y = getY(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.lineTo(padLeft + chartW, H - padBottom)
    ctx.lineTo(padLeft, H - padBottom)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, padTop, 0, H - padBottom)
    grad.addColorStop(0, lineColor)
    grad.addColorStop(1, alphaColor)
    ctx.fillStyle = grad
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.globalAlpha = 1

    if (currentPrice > 0) {
      const y = getY(currentPrice)
      ctx.save()
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.moveTo(padLeft, y)
      ctx.lineTo(padLeft + chartW, y)
      ctx.stroke()
      ctx.restore()

      ctx.beginPath()
      ctx.arc(padLeft + chartW - 1, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = lineColor
      ctx.fill()
    }
  }

  useEffect(() => {
    drawChart()
    const handleResize = () => drawChart()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      id={id}
      className={className}
      style={{ width: '100%', height: `${height}px` }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
})

GoldChart.displayName = 'GoldChart'
export default GoldChart
