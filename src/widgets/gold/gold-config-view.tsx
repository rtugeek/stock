import { useState } from 'react'
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

const REFRESH_OPTIONS = [
  { label: '30 秒', value: 30000 },
  { label: '1 分钟', value: 60000 },
  { label: '3 分钟', value: 180000 },
  { label: '5 分钟', value: 300000 },
]

const INSTRUMENT_OPTIONS = [
  { value: 'Au99.99', label: 'Au99.99 足金9999' },
  { value: 'Au99.95', label: 'Au99.95 足金9995' },
  { value: 'Au100g', label: 'Au100g 金条100g' },
  { value: 'Au(T+D)', label: 'Au(T+D) 黄金延期' },
  { value: 'mAu(T+D)', label: 'mAu(T+D) 迷你黄金' },
]

interface GoldConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: () => void
}

export default function GoldConfigView({ open = true, onOpenChange, onSave }: GoldConfigViewProps) {
  const [refreshInterval, setRefreshInterval] = useState('60000')
  const [instrumentId, setInstrumentId] = useState('Au99.99')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>黄金组件设置</DialogTitle>
          <DialogDescription>选择黄金交易合约与刷新频率</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>合约代码 (Instrument ID)</Label>
            <Select value={instrumentId} onValueChange={setInstrumentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              数据来源: 上海黄金交易所 (SGE) 实时行情
            </p>
          </div>

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

          <Separator />

          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#ffc85b">
                  <path d="M12 2L9.5 8.5 2 9.5l5.5 5.5L6 22l6-3.5L18 22l-1.5-7 5.5-5.5-7.5-1L12 2z" />
                </svg>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-amber-700 dark:text-amber-400">提示</div>
                <p className="text-muted-foreground leading-relaxed">
                  黄金价格数据每 30-60 秒刷新一次。上海黄金交易所交易时间为周一至周五 9:00-15:30，
                  夜间盘 20:00-02:30。非交易时段显示最近一次交易价格。
                </p>
              </div>
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
