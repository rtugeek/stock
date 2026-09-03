import type { WidgetThemeOption } from '@widget-js/react'
import { useState } from 'react'
import { useWidgetStorage, useWidgetTheme, WidgetThemeForm, Window } from '@widget-js/react'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { StockSelect } from '@/components/stock-select'
import { ExchangeTag } from '@/components/exchange-tag'
import { cn } from '@/lib/utils'
import type { Stock } from '@/model/stock'

const stockSmallThemeOption: WidgetThemeOption = {
  useGlobalTheme: true,
  borderRadius: true,
  backgroundColor: true,
  backgroundBorderColor: true,
  primaryColor: true,
  color: true,
} as const

interface StockSmallConfigViewProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (closeWindow?: boolean) => void
}

export default function StockSmallConfigView({ open = true, onOpenChange, onSave }: StockSmallConfigViewProps) {
  const { stockColor, setUpColorRed, setUpColorGreen } = useStockColorStore()
  const { widgetTheme, setWidgetTheme } = useWidgetTheme()

  const [stockCode, setStockCode] = useWidgetStorage<string>('stock-small-code', '01810')
  const [storedStock, setStoredStock] = useWidgetStorage<Stock | null>('stock-small-stock', null)
  const [currentStock, setCurrentStock] = useState<Stock | null>(storedStock?.code === stockCode ? storedStock : null)

  const handleSelect = (stock: Stock) => {
    setStockCode(stock.code)
    setCurrentStock(stock)
    setStoredStock(stock)
  }

  const footer = (
    <div className="flex flex-wrap justify-end gap-3">
      <Button type="button" onClick={() => window.close()}>
        关闭
      </Button>
    </div>
  )

  if (!open) return null

  return (
    <Window title="股票小组件设置" footer={footer}>
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
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base flex items-center gap-2">
                  选择股票
                </Label>
                <StockSelect
                  onSelect={handleSelect}
                  placeholder="搜索代码/名称选择"
                  existingCodes={[]}
                  clearOnSelect={false}
                />
              </div>

              {currentStock && (
                <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">{currentStock.name}</div>
                    <div className="mt-1 text-xs opacity-60 font-mono flex items-center gap-1.5">
                      <ExchangeTag exchange={currentStock.exchange} size="xs" />
                      {currentStock.code}
                    </div>
                  </div>
                </div>
              )}

              {!currentStock && (
                <div className="text-center py-10 rounded-xl border border-dashed text-sm opacity-50">
                  未选择股票，请在上方搜索选择
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="theme"
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <WidgetThemeForm
            showSectionHeader={false}
            themeOption={stockSmallThemeOption}
            value={widgetTheme}
            onChange={setWidgetTheme}
          />
        </TabsContent>
      </Tabs>
    </Window>
  )
}
