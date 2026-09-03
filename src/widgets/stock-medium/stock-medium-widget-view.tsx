import { useCallback, useEffect, useState } from 'react'
import { WidgetWrapper } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { BaiDuStockApi } from '@/api/bai-du-stock-api'
import { useInterval } from '@/hooks/use-interval'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { Stock } from '@/model/stock'

const StockMediumGlobalStyle = createGlobalStyle`


  * {
    user-select: none;
  }
`

const INDEX_CODES = ['000001', '399001', '399006'] as const
const INDEX_NAMES: Record<(typeof INDEX_CODES)[number], string> = {
  '000001': '上证指数',
  '399001': '深证成指',
  '399006': '创业板指',
}
const REFRESH_INTERVAL = 60000

function createPlaceholder(code: (typeof INDEX_CODES)[number]): Stock {
  return {
    code,
    name: INDEX_NAMES[code],
    exchange: code.startsWith('0') ? 'SH' : 'SZ',
    price: '--',
    ratio: '0',
    type: 'index',
    market: '',
    follow_status: '',
    amount: '',
    increase: '',
    amplitudeRatio: '',
    turnoverRatio: '',
    holdingAmount: '',
    volume: '',
    capitalization: '',
    peRate: '',
    pbRate: '',
    status: '',
    stockStatus: '',
    stockStatusInfo: 'TRADE',
    src_loc: '',
    subType: '',
    sf_url: '',
    pv: '',
    CNYPrice: '',
  }
}

export default function StockMediumWidgetView() {
  const { getColorByValue } = useStockColorStore()
  const [indexData, setIndexData] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)

  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        INDEX_CODES.map((code) => BaiDuStockApi.getIndex(code))
      )
      const merged = INDEX_CODES.map((code, i) => {
        const result = results[i]
        if (result.status === 'fulfilled' && result.value) {
          return result.value
        }
        return createPlaceholder(code)
      })
      setIndexData(merged)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useInterval(() => {
    void refreshAll()
  }, REFRESH_INTERVAL)

  const displayList = indexData.length > 0
    ? indexData
    : INDEX_CODES.map((code) => createPlaceholder(code))

  return (
    <WidgetWrapper>
      <StockMediumGlobalStyle />
      <div
        className="flex h-full w-full flex-col justify-center rounded-2xl px-5 py-4 text-white"
        style={{
          color: 'var(--widget-color, #ffffff)',
        }}
      >
        {displayList.map((stock) => {
          const ratio = Number.parseFloat(stock.ratio || '0')
          const { color } = getColorByValue(ratio)
          const isPlaceholder = stock.price === '--'
          return (
            <div
              key={stock.code}
              className="grid min-h-[50px] w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3"
            >
              <div className="min-w-0">
                <div className="truncate text-md font-bold leading-tight tracking-tight">
                  {stock.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm leading-none">
                  <span
                    className="inline-flex h-4 min-w-[32px] items-center justify-center rounded-md px-1 text-xs font-bold"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#ef4444' }}
                  >
                    {stock.exchange || (stock.code.startsWith('0') ? 'SH' : 'SZ')}
                  </span>
                  <span className="font-mono opacity-80">{stock.code}</span>
                </div>
              </div>

              <div className="text-right font-bold tabular-nums">
                {isPlaceholder ? '--' : formatNumber(stock.price, 2)}
              </div>

              <div
                className="flex h-6 min-w-[72px] items-center justify-center rounded-[4px] text-sm text-white tabular-nums"
                style={{ backgroundColor: isPlaceholder ? 'rgba(255,255,255,0.15)' : color }}
              >
                {isPlaceholder
                  ? loading
                    ? '加载中'
                    : '--'
                  : `${formatPercent(stock.ratio || '0')}`}
              </div>
            </div>
          )
        })}
      </div>
    </WidgetWrapper>
  )
}
