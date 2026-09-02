import * as React from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface RefreshIntervalFormItemProps {
  value: number
  onChange: (v: number) => void
  className?: string
}

const intervalOptions = [
  { label: '5秒', value: 5000 },
  { label: '15秒', value: 15000 },
  { label: '30秒', value: 30000 },
  { label: '1分钟', value: 60000 },
  { label: '5分钟', value: 300000 },
  { label: '15分钟', value: 900000 },
]

export function RefreshIntervalFormItem({ value, onChange, className }: RefreshIntervalFormItemProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor="refresh-interval">刷新间隔</Label>
      <Select
        value={String(value)}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger id="refresh-interval" className="w-[200px]">
          <SelectValue placeholder="选择刷新间隔" />
        </SelectTrigger>
        <SelectContent>
          {intervalOptions.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
