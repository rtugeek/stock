import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn, formatNumber } from '@/lib/utils'

export interface MetalInfo {
  name: string
  code: string
  currentPrice: number
  changeAmount: number
  changePercent: string
}

const METAL_ORDER = ['XAUUSD', 'XAGUSD', 'XCUUSD', 'XPTUSD']

const METAL_NAMES: Record<string, string> = {
  XAUUSD: 'Gold',
  XAGUSD: 'Silver',
  XCUUSD: 'Copper',
  XPTUSD: 'Platinum',
}

const METAL_LABEL_COLORS: Record<string, string> = {
  XAUUSD: 'bg-yellow-400/90 text-yellow-950',
  XAGUSD: 'bg-slate-300 text-slate-900',
  XCUUSD: 'bg-orange-700/80 text-orange-50',
  XPTUSD: 'bg-slate-200 text-slate-900',
}

const INITIAL_METALS: MetalInfo[] = [
  {
    name: 'Gold',
    code: 'XAUUSD',
    currentPrice: 5094.07,
    changeAmount: 81.56,
    changePercent: '1.63%',
  },
  {
    name: 'Silver',
    code: 'XAGUSD',
    currentPrice: 112.96,
    changeAmount: 9.23495,
    changePercent: '8.90%',
  },
  {
    name: 'Copper',
    code: 'XCUUSD',
    currentPrice: 5.87149,
    changeAmount: 0.02367,
    changePercent: '0.40%',
  },
  {
    name: 'Platinum',
    code: 'XPTUSD',
    currentPrice: 2703.438,
    changeAmount: 164.488,
    changePercent: '6.48%',
  },
]

export default function MetalWidgetView() {
  const [metals, setMetals] = useState<MetalInfo[]>(INITIAL_METALS)
  const [initing, setIniting] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setIniting(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const updatePrices = () => {
      setMetals((prev) =>
        prev.map((metal) => {
          const delta = (Math.random() - 0.48) * (metal.currentPrice * 0.002)
          const newPrice = metal.currentPrice + delta
          const basePrice = metal.currentPrice - metal.changeAmount
          const change = newPrice - basePrice
          const changePct = `${change >= 0 ? '+' : ''}${((change / basePrice) * 100).toFixed(2)}%`
          return {
            ...metal,
            currentPrice: newPrice,
            changeAmount: change,
            changePercent: changePct,
          }
        })
      )
    }

    const timer = setInterval(updatePrices, 15000)
    return () => clearInterval(timer)
  }, [])

  const getChangeClass = (amount: number) => {
    if (amount > 0) return 'bg-red-500 text-white'
    if (amount < 0) return 'bg-emerald-500 text-white'
    return 'bg-gray-300 text-gray-700'
  }

  return (
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
                  ${formatNumber(item.currentPrice, item.code === 'XCUUSD' ? 5 : 2)}
                </div>
                <div
                  className={cn(
                    'metal-change h-6 w-20 flex items-center justify-center rounded text-xs font-semibold tabular-nums',
                    getChangeClass(item.changeAmount)
                  )}
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
  )
}
