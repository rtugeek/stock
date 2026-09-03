import type { WidgetThemeOption } from '@widget-js/react'
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
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const coinMediumThemeOption: WidgetThemeOption = {
  useGlobalTheme: true,
  borderRadius: true,
  backgroundColor: true,
  backgroundBorderColor: true,
  primaryColor: true,
  color: true,
} as const

const REFRESH_OPTIONS = [
  { label: '3 秒', value: 3000 },
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
  { label: '1 分钟', value: 60000 },
]

interface CoinMediumConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (closeWindow?: boolean) => void
}

export default function CoinMediumConfigView({ open = true, onOpenChange, onSave }: CoinMediumConfigViewProps) {
  const { stockColor, setUpColorRed, setUpColorGreen } = useStockColorStore()
  const { widgetTheme, setWidgetTheme } = useWidgetTheme()

  const [refreshInterval, setRefreshInterval] = useWidgetStorage<string>('coin-medium-refresh', '3000')
  const { config: proxyConfig, setConfig: setProxyConfig } = useWidgetProxyConfig({ storageKey: 'coin-proxy' })

  const footer = (
    <div className="flex flex-wrap justify-end gap-3">
      <Button type="button" onClick={() => window.close()}>
        关闭
      </Button>
    </div>
  )

  if (!open) return null

  return (
    <Window title="主流虚拟币组件设置" footer={footer}>
      <Tabs defaultValue="content" className="gap-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="content">组件设置</TabsTrigger>
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

              <div className="col-span-2 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
                <Label className="whitespace-nowrap">刷新间隔</Label>
                <div className="space-y-1.5">
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
            themeOption={coinMediumThemeOption}
            value={widgetTheme}
            onChange={setWidgetTheme}
          />
        </TabsContent>
      </Tabs>
    </Window>
  )
}
