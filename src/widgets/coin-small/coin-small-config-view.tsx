import type { WidgetThemeOption } from '@widget-js/react'
import { useState } from 'react'
import { useWidgetStorage, useWidgetTheme, useWidgetProxyConfig, WidgetThemeForm, WidgetProxyField, Window } from '@widget-js/react'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Coins, type CoinType } from '@/api/coin-api'
import { cn } from '@/lib/utils'

const coinSmallThemeOption: WidgetThemeOption = {
  useGlobalTheme: true,
  borderRadius: true,
  backgroundColor: true,
  backgroundBorderColor: true,
  primaryColor: true,
  color: true,
} as const

const REFRESH_OPTIONS = [
  { label: '30 秒', value: 30000 },
  { label: '1 分钟', value: 60000 },
  { label: '3 分钟', value: 180000 },
  { label: '5 分钟', value: 300000 },
]

interface CoinSmallConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (closeWindow?: boolean) => void
}

export default function CoinSmallConfigView({ open = true, onOpenChange, onSave }: CoinSmallConfigViewProps) {
  const { stockColor, setUpColorRed, setUpColorGreen } = useStockColorStore()
  const { widgetTheme, setWidgetTheme } = useWidgetTheme()

  const [coin, setCoin] = useWidgetStorage<CoinType | string>('coin-small-type', 'BTC-USD')
  const [refreshInterval, setRefreshInterval] = useWidgetStorage<string>('coin-small-refresh', '60000')
  const { config: proxyConfig, setConfig: setProxyConfig } = useWidgetProxyConfig({ storageKey: 'coin-proxy' })

  const selectedCoin = Coins.find((c) => c.type === coin) || Coins[0]

  const footer = (
    <div className="flex flex-wrap justify-end gap-3">
      <Button type="button" onClick={() => window.close()}>
        关闭
      </Button>
    </div>
  )

  if (!open) return null

  return (
    <Window title="虚拟币小组件设置" footer={footer}>
      <Tabs defaultValue="content" className="gap-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="content">虚拟币设置</TabsTrigger>
          <TabsTrigger value="theme">主题设置</TabsTrigger>
        </TabsList>

        <TabsContent
          value="content"
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="col-span-2 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
                <Label className="whitespace-nowrap">涨跌颜色</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={setUpColorRed}
                    className={cn(
                      'px-2 py-1 rounded-md border transition-all flex items-center gap-1 text-xs',
                      stockColor === 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <ArrowUp className="h-3 w-3" style={{ color: '#ef4444' }} />
                    <span className="font-medium" style={{ color: '#ef4444' }}>红</span>
                    <span className="text-muted-foreground text-[10px]">/</span>
                    <ArrowDown className="h-3 w-3" style={{ color: '#22c55e' }} />
                    <span className="font-medium" style={{ color: '#22c55e' }}>绿</span>
                  </button>
                  <button
                    type="button"
                    onClick={setUpColorGreen}
                    className={cn(
                      'px-2 py-1 rounded-md border transition-all flex items-center gap-1 text-xs',
                      stockColor === 1 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <ArrowUp className="h-3 w-3" style={{ color: '#22c55e' }} />
                    <span className="font-medium" style={{ color: '#22c55e' }}>绿</span>
                    <span className="text-muted-foreground text-[10px]">/</span>
                    <ArrowDown className="h-3 w-3" style={{ color: '#ef4444' }} />
                    <span className="font-medium" style={{ color: '#ef4444' }}>红</span>
                  </button>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3">
                <Label className="whitespace-nowrap pt-2">虚拟币</Label>
                <div className="space-y-3">
                  <Select value={coin} onValueChange={(v) => setCoin(v as CoinType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Coins.map((c) => (
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
                            {c.ccy && (
                              <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                                {c.ccy}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
              </div>

              <div className="col-span-2 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
                <Label className="whitespace-nowrap">刷新间隔</Label>
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
            </div>

            <Separator />

            <WidgetProxyField
              protocol={proxyConfig.protocol}
              host={proxyConfig.host}
              port={proxyConfig.port}
              onProtocolChange={(value) => setProxyConfig((prev) => ({ ...prev, protocol: value }))}
              onHostChange={(value) => setProxyConfig((prev) => ({ ...prev, host: value }))}
              onPortChange={(value) => setProxyConfig((prev) => ({ ...prev, port: value }))}
              labelWidth={88}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="theme"
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <WidgetThemeForm
            showSectionHeader={false}
            themeOption={coinSmallThemeOption}
            value={widgetTheme}
            onChange={setWidgetTheme}
          />
        </TabsContent>
      </Tabs>
    </Window>
  )
}
