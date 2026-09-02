import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { cn } from '@/lib/utils'

interface StockColorFormItemProps {
  onChange: (v: 0 | 1) => void
  className?: string
}

const colorOptions = [
  {
    value: 0 as const,
    label: '红涨绿跌 (中国习惯)',
    render: (
      <span className="inline-flex items-center gap-1">
        <span className="text-red-500 font-medium">红涨</span>
        <span className="text-green-500 font-medium">绿跌</span>
      </span>
    ),
  },
  {
    value: 1 as const,
    label: '绿涨红跌 (欧美习惯)',
    render: (
      <span className="inline-flex items-center gap-1">
        <span className="text-green-500 font-medium">绿涨</span>
        <span className="text-red-500 font-medium">红跌</span>
      </span>
    ),
  },
]

export function StockColorFormItem({ onChange, className }: StockColorFormItemProps) {
  const { stockColor, setUpColorRed, setUpColorGreen } = useStockColorStore()

  const handleChange = (v: 0 | 1) => {
    onChange(v)
    if (v === 0) {
      setUpColorRed()
    }
    else {
      setUpColorGreen()
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label>涨跌颜色</Label>
      <Select
        value={String(stockColor)}
        onValueChange={(v) => handleChange(Number(v) as 0 | 1)}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="选择涨跌颜色" />
        </SelectTrigger>
        <SelectContent>
          {colorOptions.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.render}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 mt-1">
        {colorOptions.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={stockColor === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleChange(opt.value)}
            className="flex-1"
          >
            {opt.render}
          </Button>
        ))}
      </div>
    </div>
  )
}
