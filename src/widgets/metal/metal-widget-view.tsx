import { useEffect, useRef, useState } from 'react'
import { WidgetWrapper } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import { Badge } from '@/components/ui/badge'
import { MetalApi } from '@/api/metal-api'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { cn, formatNumber } from '@/lib/utils'

const MetalGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

export interface MetalInfo {
  name: string
  code: string
  currentPrice: number
  changeAmount: number
  changePercent: string
}

const METAL_LABEL_COLORS: Record<string, string> = {
  XAUUSD: 'bg-yellow-400/90 text-yellow-950',
  XAGUSD: 'bg-slate-300 text-slate-900',
  XCUUSD: 'bg-orange-700/80 text-orange-50',
  XPTUSD: 'bg-slate-200 text-slate-900',
}

export default function MetalWidgetView() {
  const { getColorByValue } = useStockColorStore()
  const [metals, setMetals] = useState<MetalInfo[]>([])
  const [initing, setIniting] = useState(true)
  const [error, setError] = useState('')
  const hasDataRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const updatePrices = async () => {
      try {
        const prices = await MetalApi.getPrices()
        if (cancelled) return
        setMetals(() =>
          prices.map((metal) => {
            return {
              name: metal.name,
              code: metal.code,
              currentPrice: metal.price,
              changeAmount: metal.changePercent,
              changePercent: `${metal.changePercent.toFixed(2)}%`,
            }
          })
        )
        hasDataRef.current = true
        setError('')
      } catch (requestError) {
        console.error('Failed to refresh metal prices', requestError)
        if (!hasDataRef.current) setError('行情暂不可用')
      } finally {
        if (!cancelled) setIniting(false)
      }
    }

    updatePrices()
    const timer = setInterval(updatePrices, 30000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const getChangeStyle = (amount: number) => {
    if (amount === 0) {
      return { backgroundColor: 'rgb(209,213,219)', color: 'rgb(55,65,81)' }
    }
    const { color } = getColorByValue(amount)
    return { backgroundColor: color, color: 'white' }
  }

  return (
    <WidgetWrapper>
      <MetalGlobalStyle />
      <div
        className="w-full h-full overflow-y-auto"
        style={{ color: 'var(--widget-color, inherit)' }}
      >
      <div className="metal-data flex flex-col p-4 w-full h-full box-border gap-2">
        {initing ? (
          <div className="flex-1 flex items-center justify-center opacity-70 text-sm">
            加载中...
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="metal-list w-full flex flex-col gap-3">
            {metals.map((item) => (
              <div key={item.code} className="metal-item w-full flex items-center gap-2">
                <div className="flex flex-col justify-between gap-1 items-start">
                  <span className="metal-title text-base font-bold leading-tight">
                    {item.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'h-4 px-1.5 text-[10px] font-mono font-semibold border-0',
                      METAL_LABEL_COLORS[item.code] || METAL_LABEL_COLORS.XAUUSD
                    )}
                  >
                    {item.code.replace('USD', '').toUpperCase()}
                  </Badge>
                </div>
                <div className="ml-auto tabular-nums font-semibold text-sm">
                  ${formatNumber(item.currentPrice, 2)}
                </div>
                <div
                  className={cn(
                    'metal-change h-6 w-20 flex items-center justify-center rounded text-xs font-semibold tabular-nums'
                  )}
                  style={getChangeStyle(item.changeAmount)}
                >
                  {item.changeAmount > 0 ? '+' : ''}
                  {item.changePercent}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </WidgetWrapper>
  )
}
