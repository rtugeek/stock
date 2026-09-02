import { useEffect, useState } from 'react'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn, formatNumber, formatPercent } from '@/lib/utils'
import type { Stock } from '@/model/stock'
import type { StockType } from '@/api/bai-du-stock-api'

const REFRESH_OPTIONS = [
  { label: '30 秒', value: 30000 },
  { label: '1 分钟', value: 60000 },
  { label: '3 分钟', value: 180000 },
  { label: '5 分钟', value: 300000 },
]

const STOCK_OPTIONS: Array<{ code: string; name: string; type: StockType; exchange: string; price: string; ratio: string }> = [
  { code: '01810', name: '小米集团-W', type: 'stock', exchange: 'HK', price: '18.56', ratio: '1.87' },
  { code: '00700', name: '腾讯控股', type: 'stock', exchange: 'HK', price: '382.40', ratio: '-2.10' },
  { code: 'AAPL', name: 'Apple', type: 'stock', exchange: 'NSD', price: '189.84', ratio: '1.23' },
  { code: 'GOOGL', name: 'Alphabet', type: 'stock', exchange: 'NSD', price: '142.65', ratio: '-1.26' },
  { code: 'TSLA', name: 'Tesla', type: 'stock', exchange: 'NSD', price: '248.50', ratio: '2.14' },
  { code: 'MSFT', name: 'Microsoft', type: 'stock', exchange: 'NSD', price: '420.72', ratio: '0.75' },
  { code: 'NVDA', name: 'NVIDIA', type: 'stock', exchange: 'NSD', price: '875.30', ratio: '1.45' },
  { code: '000001', name: '平安银行', type: 'stock', exchange: 'SZ', price: '11.25', ratio: '0.89' },
  { code: '600519', name: '贵州茅台', type: 'stock', exchange: 'SH', price: '1685.00', ratio: '-0.65' },
]

interface StockSmallConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: () => void
}

export default function StockSmallConfigView({ open = true, onOpenChange, onSave }: StockSmallConfigViewProps) {
  const { stockColor, setUpColorRed, setUpColorGreen, getUpColor, getDownColor } = useStockColorStore()

  const [stockCode, setStockCode] = useState<string>('01810')
  const [stockType, setStockType] = useState<StockType>('stock')
  const [refreshInterval, setRefreshInterval] = useState('60000')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    const current = STOCK_OPTIONS.find((s) => s.code === stockCode)
    if (current) {
      setKeyword(`${current.name}(${current.code})`)
    }
  }, [stockCode])

  const filtered = STOCK_OPTIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(keyword.toLowerCase()) ||
      s.code.toLowerCase().includes(keyword.toLowerCase())
  )

  const handleSelect = (opt: { code: string; type: StockType }) => {
    setStockCode(opt.code)
    setStockType(opt.type)
  }

  const currentStock = STOCK_OPTIONS.find((s) => s.code === stockCode)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>股票小型组件设置</DialogTitle>
          <DialogDescription>选择要跟踪的股票代码和刷新频率</DialogDescription>
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

          <div className="space-y-3">
            <Label>搜索股票</Label>
            <Input
              placeholder="输入股票代码或名称搜索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {currentStock && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{currentStock.name}</div>
                  <div className="text-xs opacity-60 font-mono flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-opacity-60">
                      {currentStock.exchange}
                    </Badge>
                    {currentStock.code}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{formatNumber(currentStock.price)}</div>
                  <div
                    className="text-xs tabular-nums"
                    style={{
                      color: Number.parseFloat(currentStock.ratio) >= 0 ? getUpColor() : getDownColor(),
                    }}
                  >
                    {formatPercent(currentStock.ratio)}
                  </div>
                </div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
              {filtered.map((opt) => {
                const isSelected = opt.code === stockCode
                const isUp = Number.parseFloat(opt.ratio) >= 0
                return (
                  <button
                    key={opt.code}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 text-left transition-colors',
                      isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-1.5">
                        {opt.name}
                        {isSelected && <Badge className="text-[10px] h-4 px-1.5">已选</Badge>}
                      </div>
                      <div className="text-xs opacity-60 font-mono">
                        <Badge variant="outline" className="text-[10px] h-4 px-1 mr-1 border-opacity-50">
                          {opt.exchange}
                        </Badge>
                        {opt.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium tabular-nums">{formatNumber(opt.price)}</div>
                      <div
                        className="text-xs tabular-nums"
                        style={{ color: isUp ? getUpColor() : getDownColor() }}
                      >
                        {formatPercent(opt.ratio)}
                      </div>
                    </div>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-sm opacity-50">无匹配结果</div>
              )}
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
