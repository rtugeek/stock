import * as React from 'react'
import { useState, useEffect } from 'react'
import { GripVertical, Trash2, Edit3, Check, X } from 'lucide-react'
import type { Stock } from '@/model/stock'
import { StockItem } from '@/components/stock-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface SelfSelectStockItemProps {
  stock: Stock
  onDelete: (stock: Stock) => void
  onEditHolding?: (stock: Stock, holdingShares: number, holdingPrice: number) => void
  className?: string
}

export function SelfSelectStockItem({ stock, onDelete, onEditHolding, className }: SelfSelectStockItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [holdingShares, setHoldingShares] = useState<number>(stock.holdingShares ?? 0)
  const [holdingPrice, setHoldingPrice] = useState<number>(stock.holdingPrice ?? 0)

  useEffect(() => {
    setHoldingShares(stock.holdingShares ?? 0)
    setHoldingPrice(stock.holdingPrice ?? 0)
  }, [stock])

  const handleSave = () => {
    onEditHolding?.(stock, holdingShares, holdingPrice)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setHoldingShares(stock.holdingShares ?? 0)
    setHoldingPrice(stock.holdingPrice ?? 0)
    setIsEditing(false)
  }

  return (
    <Card className={cn('p-2', className)}>
      <div className="flex items-center gap-2">
        <div className="handler cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground transition-colors">
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <StockItem stock={stock} className="p-0 hover:bg-transparent" />

          {isEditing && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t text-[0.8rem]">
              <div className="flex items-center gap-1.5">
                <Label className="whitespace-nowrap text-xs">持有份额:</Label>
                <Input
                  type="number"
                  value={holdingShares}
                  onChange={(e) => setHoldingShares(Number(e.target.value))}
                  min={0}
                  step={100}
                  className="h-7 w-20 text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="whitespace-nowrap text-xs">持仓价:</Label>
                <Input
                  type="number"
                  value={holdingPrice}
                  onChange={(e) => setHoldingPrice(Number(e.target.value))}
                  min={0}
                  step={0.01}
                  className="h-7 w-20 text-xs"
                />
              </div>
              <div className="flex gap-1 ml-auto">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleSave}
                >
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleCancel}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          )}

          {!isEditing && onEditHolding && (
            (stock.holdingShares !== undefined || stock.holdingPrice !== undefined) && (
              <div className="mt-2 pt-2 border-t text-[0.75rem] text-muted-foreground">
                <span className="mr-3">持有: {stock.holdingShares ?? 0}股</span>
                <span>成本: {(stock.holdingPrice ?? 0).toFixed(2)}</span>
              </div>
            )
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onEditHolding && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className={cn('h-4 w-4', isEditing ? 'text-primary' : '')} />
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(stock)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
