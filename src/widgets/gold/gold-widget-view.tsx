import { useEffect, useMemo, useRef, useState } from 'react'
import GoldChart from './gold-chart'
import type { GoldChartHandle } from './gold-chart'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { GoldApiResponse } from '@/api/gold-api'

const GOLD_LINE_COLOR = '#ffc85b'

function generateMockGoldData(): GoldApiResponse {
  const times: string[] = []
  const data: string[] = []
  const startPrice = 750
  let price = startPrice
  for (let h = 9; h <= 15; h++) {
    for (let m = 0; m < 60; m += 5) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      price += (Math.random() - 0.48) * 1.8
      data.push(price.toFixed(2))
    }
  }
  const numericData = data.map(Number)
  return {
    times,
    data,
    min: Math.min(...numericData),
    max: Math.max(...numericData),
    heyue: 'Au99.99',
    delaystr: `2025-04-28 ${times[times.length - 1]}:00`,
  }
}

export default function GoldWidgetView() {
  const goldChartRef = useRef<GoldChartHandle>(null)
  const [instrumentId] = useState('Au99.99')
  const [goldData, setGoldData] = useState<GoldApiResponse>(() => generateMockGoldData())
  const [isUpgrade] = useState(false)
  const [yesterdayClose, setYesterdayClose] = useState<number>(748.5)
  const [todayClose, setTodayClose] = useState<number>(0)

  useEffect(() => {
    const updateChart = () => {
      const currentPriceValue = currentPrice
      goldChartRef.current?.update(goldData.data, currentPriceValue)
    }
    const timer = setTimeout(updateChart, 50)
    return () => clearTimeout(timer)
  }, [goldData])

  const currentPrice = useMemo<number>(() => {
    const data = goldData?.data
    if (data && data.length > 0) {
      const delayParts = goldData!.delaystr.split(' ')
      if (delayParts.length > 1) {
        const timePart = delayParts[1]
        const times = timePart.split(':')
        const delayTime = `${times[0]}:${times[1]}`
        let index = goldData!.times.findIndex((it) => it === delayTime)
        if (index === -1) {
          index = data.length - 1
        } else {
          index = index > data.length - 1 ? data.length - 1 : index
        }
        const current = Number(data[index])
        return current
      }
      return Number(data[data.length - 1])
    }
    return 0
  }, [goldData])

  useEffect(() => {
    const fetchData = async () => {
      setGoldData(generateMockGoldData())
      setTodayClose(Number((755 + Math.random() * 5).toFixed(2)))
    }
    fetchData()
    const timer = setInterval(fetchData, 60000)
    return () => clearInterval(timer)
  }, [instrumentId])

  const change = useMemo(() => currentPrice - yesterdayClose, [currentPrice, yesterdayClose])
  const changeRatio = useMemo(
    () => (yesterdayClose > 0 ? (change / yesterdayClose) * 100 : 0),
    [change, yesterdayClose]
  )
  const isUp = change >= 0

  return (
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
        className="px-4 text-3xl font-light leading-none tabular-nums"
        style={{ color: isUp ? '#e53935' : '#43a047' }}
      >
        {isUpgrade && currentPrice === 0 ? '接口升级中' : formatNumber(currentPrice, 2)}
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
  )
}
