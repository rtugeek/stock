import * as React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Stock } from '@/model/stock'
import { ExchangeTag } from '@/components/exchange-tag'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { cn } from '@/lib/utils'

interface StockItemProps {
  stock: Stock
  onClick?: () => void
  className?: string
}

export function StockItem({ stock, onClick, className }: StockItemProps) {
  const { getColorByValue } = useStockColorStore()

  const ratioValue = Number(stock.ratio?.replace('%', '') || 0)
  const isUp = stock.increase?.startsWith('+') || ratioValue >= 0
  const colorConfig = getColorByValue(ratioValue)

  const currentPrice = Number.parseFloat(stock.price || '0')

  return (
    <div
      className={cn(
        'stock-item flex items-center gap-2 w-full cursor-pointer hover:bg-accent/50 rounded-md p-1 transition-colors',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between gap-1 min-w-0">
        <div className="stock-title w-[7rem] whitespace-nowrap text-[0.9rem] font-bold truncate overflow-hidden">
          {stock.name}
        </div>
        <div className="info flex items-center gap-1 text-[0.7rem] text-muted-foreground">
          <ExchangeTag exchange={stock.exchange} />
          <span className="truncate">{stock.code}</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="stock-price w-[3.5rem] text-right font-medium tabular-nums">
          {currentPrice.toFixed(2)}
        </span>
        <span
          className={cn(
            'stock-change inline-flex items-center justify-center rounded h-6 w-16 text-[0.8rem] text-white font-medium',
            isUp ? 'bg-up-color' : 'bg-down-color',
          )}
          style={{ backgroundColor: colorConfig.color }}
        >
          {isUp ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
          {stock.ratio}
        </span>
      </div>
    </div>
  )
}
