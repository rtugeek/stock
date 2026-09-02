import { useEffect, useMemo, useRef, useState } from 'react'
import { useWidget, WidgetWrapper } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import GoldChart from './gold-chart'
import type { GoldChartHandle } from './gold-chart'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatPercent } from '@/lib/utils'
import { GoldApi, type GoldApiResponse } from '@/api/gold-api'

const GOLD_LINE_COLOR = '#ffc85b'

const GoldGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

const EMPTY_GOLD_DATA: GoldApiResponse = {
  times: [],
  data: [],
  min: 0,
  max: 0,
  heyue: 'Au99.99',
  delaystr: '',
  latestPrice: 0,
  yesterdayClose: 0,
}

export default function GoldWidgetView() {
  useWidget()
  const goldChartRef = useRef<GoldChartHandle>(null)
  const [instrumentId] = useState('Au99.99')
  const [goldData, setGoldData] = useState<GoldApiResponse>(EMPTY_GOLD_DATA)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [yesterdayClose, setYesterdayClose] = useState(0)

  useEffect(() => {
    const updateChart = () => {
      const currentPriceValue = currentPrice
      goldChartRef.current?.update(goldData.data, currentPriceValue)
    }
    const timer = setTimeout(updateChart, 50)
    return () => clearTimeout(timer)
  }, [goldData])

  const currentPrice = goldData.latestPrice

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nextData = await GoldApi.quotations(instrumentId)
        setGoldData(nextData)
        setYesterdayClose(nextData.yesterdayClose)
        setIsUnavailable(false)
      } catch (error) {
        console.error('Failed to refresh gold quote', error)
        setIsUnavailable(true)
      }
    }
    fetchData()
    const timer = setInterval(fetchData, 5000)
    return () => clearInterval(timer)
  }, [instrumentId])

  const change = useMemo(() => currentPrice - yesterdayClose, [currentPrice, yesterdayClose])
  const changeRatio = useMemo(
    () => (yesterdayClose > 0 ? (change / yesterdayClose) * 100 : 0),
    [change, yesterdayClose]
  )
  const isUp = change >= 0

  return (
    <WidgetWrapper>
      <GoldGlobalStyle />
      <div
        className="w-full h-full flex flex-col"
        style={{ color: 'var(--widget-color, inherit)' }}
      >
        <div className="px-4 pt-4 pb-2">
          <div className="flex flex-col gap-2">
            <div className="text-base font-bold leading-tight">黄金价格</div>
            <div className="flex items-center gap-1 text-xs">
              <Badge
                className="h-4 px-1.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: GOLD_LINE_COLOR + '33',
                  color: '#b8860b',
                  border: `1px solid ${GOLD_LINE_COLOR}55`,
                }}
              >
                AU99.99
              </Badge>
              <span
                className="ml-auto tabular-nums font-semibold text-xs"
                style={{ color: isUp ? '#e53935' : '#43a047' }}
              >
                {isUp ? '+' : ''}
                {formatNumber(change)} ({formatPercent(changeRatio)})
              </span>
            </div>
          </div>
        </div>

        <div
          className="px-4 text-3xl font-bold leading-none tabular-nums"
          style={{ color: GOLD_LINE_COLOR }}
        >
          {isUnavailable && currentPrice === 0 ? '行情暂不可用' : formatNumber(currentPrice, 2)}
        </div>

        <div className="px-4 py-1 text-[10px] opacity-60 flex justify-between tabular-nums">
          <span>昨收: {formatNumber(yesterdayClose, 2)}</span>
          <span>最高: {formatNumber(goldData.max, 2)}</span>
          <span>最低: {formatNumber(goldData.min, 2)}</span>
        </div>

        <div className="flex-1 px-2 pt-1 pb-3 min-h-0">
          <GoldChart ref={goldChartRef} height={120} />
        </div>
      </div>
    </WidgetWrapper>
  )
}
