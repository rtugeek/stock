import * as React from 'react'
import { cn } from '@/lib/utils'
import { useStockColorStore } from '@/store/use-stock-color-store'

interface GoldTagProps {
  label: string
  value: string
  change?: number
  className?: string
}

export function GoldTag({ label, value, change, className }: GoldTagProps) {
  const { getColorByValue } = useStockColorStore()
  const colorConfig = change !== undefined ? getColorByValue(change) : null

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-[0.8rem]', className)}>
      <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 font-medium">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
      {change !== undefined && (
        <span
          className="font-medium"
          style={{ color: colorConfig?.color }}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}
        </span>
      )}
    </div>
  )
}
