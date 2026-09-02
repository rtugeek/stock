import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const CHART_TYPE_OPTIONS = [
  { label: '迷你折线图 (默认)', value: 'mini-line' },
  { label: '仅价格 (紧凑)', value: 'price-only' },
  { label: 'K线预览', value: 'mini-candle' },
]

const REFRESH_OPTIONS = [
  { label: '3 秒 (实时)', value: 3000 },
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
  { label: '1 分钟', value: 60000 },
]

interface CoinMediumConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: () => void
}

export default function CoinMediumConfigView({ open = true, onOpenChange, onSave }: CoinMediumConfigViewProps) {
  const [chartType, setChartType] = useState('mini-line')
  const [refreshInterval, setRefreshInterval] = useState('3000')
  const [proxyHost, setProxyHost] = useState('')
  const [proxyPort, setProxyPort] = useState('')
  const [proxyProtocol, setProxyProtocol] = useState<'http' | 'https'>('http')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>主流虚拟币组件设置</DialogTitle>
          <DialogDescription>配置图表样式与数据刷新频率</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>图表类型</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <p className="text-xs text-muted-foreground">
              OKX WebSocket 行情推送，实际延迟取决于网络环境
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>代理配置 (可选)</Label>
            <p className="text-xs text-muted-foreground -mt-2">
              如果访问 OKX WebSocket 或 REST API 受阻，可配置 HTTP/HTTPS 代理
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="proxy-protocol-m" className="text-xs">协议</Label>
                <Select
                  value={proxyProtocol}
                  onValueChange={(v) => setProxyProtocol(v as 'http' | 'https')}
                >
                  <SelectTrigger id="proxy-protocol-m">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="https">HTTPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="proxy-host-m" className="text-xs">主机</Label>
                <Input
                  id="proxy-host-m"
                  placeholder="127.0.0.1"
                  className="h-9 text-xs"
                  value={proxyHost}
                  onChange={(e) => setProxyHost(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="proxy-port-m" className="text-xs">端口</Label>
                <Input
                  id="proxy-port-m"
                  placeholder="7890"
                  className="h-9 text-xs tabular-nums"
                  value={proxyPort}
                  onChange={(e) => setProxyPort(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-sky-700 dark:text-sky-400">数据说明</div>
                <p className="text-muted-foreground leading-relaxed">
                  行情数据来源：OKX 官方 WebSocket (index-tickers-3s 频道)。
                  24小时涨跌幅以 UTC+8 开盘价为基准计算。支持的币对列表在 API/CoinApi.ts 中维护。
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
