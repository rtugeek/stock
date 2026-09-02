import { useState } from 'react'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const REFRESH_OPTIONS = [
  { label: '30 秒', value: 30000 },
  { label: '1 分钟', value: 60000 },
  { label: '3 分钟', value: 180000 },
  { label: '5 分钟', value: 300000 },
]

const CHART_HEIGHT_OPTIONS = [
  { label: '紧凑 (60px)', value: 60 },
  { label: '标准 (80px)', value: 80 },
  { label: '大号 (100px)', value: 100 },
  { label: '特大 (120px)', value: 120 },
]

interface StockMediumConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: () => void
}

export default function StockMediumConfigView({ open = true, onOpenChange, onSave }: StockMediumConfigViewProps) {
  const { stockColor, setUpColorRed, setUpColorGreen, getUpColor, getDownColor } = useStockColorStore()
  const [refreshInterval, setRefreshInterval] = useState('60000')
  const [chartHeight, setChartHeight] = useState('80')
  const [stockCodes, setStockCodes] = useState('000001,399001,399006')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>大A指数设置</DialogTitle>
          <DialogDescription>配置指数代码、刷新频率和图表高度</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>刷新间隔</Label>
            <Select value={refreshInterval} onValueChange={setRefreshInterval}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>图表高度</Label>
            <Select value={chartHeight} onValueChange={setChartHeight}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_HEIGHT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>指数代码 (逗号分隔)</Label>
            <div className="text-xs text-muted-foreground mb-2">
              当前代码: <span className="font-mono">{stockCodes}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { codes: '000001,399001,399006', name: '大A三大指数' },
                { codes: '000001,000300,000905,399006', name: '宽基指数' },
                { codes: '000001,399001', name: '上证+深证' },
                { codes: 'HSI,HSCEI,000001', name: '港股+上证' },
              ].map((preset) => (
                <button
                  key={preset.codes}
                  onClick={() => setStockCodes(preset.codes)}
                  className={cn(
                    'p-2 rounded-md border text-left text-xs transition-colors',
                    stockCodes === preset.codes
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="font-mono opacity-60 mt-0.5">{preset.codes}</div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>涨跌颜色</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={setUpColorRed}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all text-left',
                  stockColor === 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getUpColor() }} />
                  <span style={{ color: getUpColor() }}>红涨</span>
                  <span className="opacity-50">/</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getDownColor() }} />
                  <span style={{ color: getDownColor() }}>绿跌</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">A 股习惯</div>
              </button>
              <button
                onClick={setUpColorGreen}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all text-left',
                  stockColor === 1 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getUpColor() }} />
                  <span style={{ color: getUpColor() }}>绿涨</span>
                  <span className="opacity-50">/</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getDownColor() }} />
                  <span style={{ color: getDownColor() }}>红跌</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">港股/美股习惯</div>
              </button>
            </div>
          </div>
        </div>
        <Separator />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>取消</Button>
          <Button onClick={onSave}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
