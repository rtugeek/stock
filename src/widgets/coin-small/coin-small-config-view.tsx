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
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Coins, type CoinType } from '@/api/coin-api'
import { formatNumber } from '@/lib/utils'

const REFRESH_OPTIONS = [
  { label: '30 秒', value: 30000 },
  { label: '1 分钟', value: 60000 },
  { label: '3 分钟', value: 180000 },
  { label: '5 分钟', value: 300000 },
]

const MOCK_PRICES: Record<string, { price: string; rate: string; isUp: boolean }> = {
  'BTC-USD': { price: '68250.25', rate: '+2.45%', isUp: true },
  'ETH-USD': { price: '3520.40', rate: '+1.82%', isUp: true },
  'SOL-USD': { price: '148.65', rate: '-0.65%', isUp: false },
  'BNB-USD': { price: '598.30', rate: '+0.92%', isUp: true },
  'XRP-USD': { price: '0.5234', rate: '-1.25%', isUp: false },
  'DOGE-USD': { price: '0.1245', rate: '+3.78%', isUp: true },
}

interface CoinSmallConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: () => void
}

export default function CoinSmallConfigView({ open = true, onOpenChange, onSave }: CoinSmallConfigViewProps) {
  const [coin, setCoin] = useState<CoinType | string>('BTC-USD')
  const [refreshInterval, setRefreshInterval] = useState('60000')
  const [proxyHost, setProxyHost] = useState('')
  const [proxyPort, setProxyPort] = useState('')
  const [proxyProtocol, setProxyProtocol] = useState<'http' | 'https'>('http')

  const selectedCoin = Coins.find((c) => c.type === coin) || Coins[0]
  const priceInfo = MOCK_PRICES[coin] || MOCK_PRICES['BTC-USD']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>虚拟币组件设置</DialogTitle>
          <DialogDescription>选择币种和刷新频率，可配置代理访问 OKX 行情</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <Label>虚拟币</Label>
            <Select value={coin} onValueChange={(v) => setCoin(v as CoinType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Coins.map((c) => {
                  const info = MOCK_PRICES[c.type]
                  return (
                    <SelectItem key={c.type} value={c.type}>
                      <div className="flex items-center gap-2 pr-6 w-full">
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="w-5 h-5 rounded-full flex-shrink-0"
                          onError={(e) => {
                            const base = (import.meta as any).env?.BASE_URL || '/'
                            ;(e.target as HTMLImageElement).src = `${base}coin/bitcoin.png`
                          }}
                        />
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                          {info ? `$${formatNumber(info.price)}` : ''}
                        </span>
                        {info && (
                          <span
                            className="text-xs tabular-nums"
                            style={{ color: info.isUp ? '#22c55e' : '#ef4444' }}
                          >
                            {info.rate}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {selectedCoin && (
              <div className="p-3 rounded-lg bg-muted/40 border flex items-center gap-3">
                <img
                  src={selectedCoin.logo}
                  alt={selectedCoin.name}
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex-shrink-0"
                  onError={(e) => {
                    const base = (import.meta as any).env?.BASE_URL || '/'
                    ;(e.target as HTMLImageElement).src = `${base}coin/bitcoin.png`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{selectedCoin.name}</span>
                    {selectedCoin.ccy && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        {selectedCoin.ccy}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs opacity-60 font-mono mt-0.5">{selectedCoin.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">${formatNumber(priceInfo.price)}</div>
                  <div
                    className="text-xs tabular-nums"
                    style={{ color: priceInfo.isUp ? '#22c55e' : '#ef4444' }}
                  >
                    {priceInfo.rate}
                  </div>
                </div>
              </div>
            )}
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

          <div className="space-y-3">
            <Label>代理配置 (可选)</Label>
            <p className="text-xs text-muted-foreground -mt-2">
              如果访问 OKX API 受阻，可配置 HTTP/HTTPS 代理
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="proxy-protocol" className="text-xs">协议</Label>
                <Select
                  value={proxyProtocol}
                  onValueChange={(v) => setProxyProtocol(v as 'http' | 'https')}
                >
                  <SelectTrigger id="proxy-protocol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="https">HTTPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="proxy-host" className="text-xs">主机</Label>
                <Input
                  id="proxy-host"
                  placeholder="127.0.0.1"
                  className="h-9 text-xs"
                  value={proxyHost}
                  onChange={(e) => setProxyHost(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="proxy-port" className="text-xs">端口</Label>
                <Input
                  id="proxy-port"
                  placeholder="7890"
                  className="h-9 text-xs tabular-nums"
                  value={proxyPort}
                  onChange={(e) => setProxyPort(e.target.value)}
                />
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
