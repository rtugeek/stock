import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

const METAL_OPTIONS = [
  { code: 'XAUUSD', name: 'Gold (黄金)', color: 'bg-yellow-400/90 text-yellow-950' },
  { code: 'XAGUSD', name: 'Silver (白银)', color: 'bg-slate-300 text-slate-900' },
  { code: 'XCUUSD', name: 'Copper (铜)', color: 'bg-orange-700/80 text-orange-50' },
  { code: 'XPTUSD', name: 'Platinum (铂金)', color: 'bg-slate-200 text-slate-900' },
  { code: 'XPDUSD', name: 'Palladium (钯金)', color: 'bg-zinc-300 text-zinc-900' },
]

interface MetalConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: () => void
}

export default function MetalConfigView({ open = true, onOpenChange, onSave }: MetalConfigViewProps) {
  const [refreshInterval, setRefreshInterval] = useState('60000')
  const [metalId, setMetalId] = useState('XAUUSD')
  const [showAll, setShowAll] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>国际贵金属组件设置</DialogTitle>
          <DialogDescription>配置金属列表、刷新频率和显示选项</DialogDescription>
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
            <div className="flex items-center justify-between">
              <Label>显示模式</Label>
              <div className="flex gap-1 p-0.5 bg-muted rounded-md">
                <button
                  onClick={() => setShowAll(true)}
                  className={cn(
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    showAll ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  全部显示
                </button>
                <button
                  onClick={() => setShowAll(false)}
                  className={cn(
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    !showAll ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  单选
                </button>
              </div>
            </div>

            {!showAll && (
              <div className="space-y-2">
                <Label>默认金属</Label>
                <Select value={metalId} onValueChange={setMetalId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'h-4 px-1.5 text-[10px] font-mono font-semibold border-0',
                              opt.color
                            )}
                          >
                            {opt.code.replace('USD', '').toUpperCase()}
                          </Badge>
                          <span>{opt.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showAll && (
              <div className="rounded-lg border p-3 space-y-2">
                <Label className="text-xs opacity-80">显示列表</Label>
                <div className="grid grid-cols-2 gap-2">
                  {METAL_OPTIONS.map((opt) => (
                    <div
                      key={opt.code}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/40"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          'h-4 px-1.5 text-[10px] font-mono font-semibold border-0 flex-shrink-0',
                          opt.color
                        )}
                      >
                        {opt.code.replace('USD', '').toUpperCase()}
                      </Badge>
                      <span className="text-xs truncate">{opt.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-orange-700 dark:text-orange-400">数据来源</div>
                <p className="text-muted-foreground leading-relaxed">
                  国际贵金属价格数据通过 Supabase api_center 表获取，每分钟更新一次。
                  包含：XAUUSD 黄金、XAGUSD 白银、XCUUSD 铜、XPTUSD 铂金 实时行情。
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
