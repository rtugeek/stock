import { useCallback, useEffect, useState } from 'react'
import type { Stock } from '@/model/stock'
import { BaiDuStockApi } from '@/api/bai-du-stock-api'
import { useStockColorStore } from '@/store/use-stock-color-store'
import { useInterval } from './use-interval'

export function useStock(code: string, refreshInterval: number = 60000) {
  const [stock, setStock] = useState<Stock>()
  const [isUp, setIsUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const getColorByValue = useStockColorStore((state) => state.getColorByValue)
  const colorObj = getColorByValue(isUp)
  const color = colorObj.color

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await BaiDuStockApi.getByType<Stock>(code)
      setStock(result)
      setIsUp(result?.increase?.includes('+') ?? false)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    refresh()
  }, [refresh])

  useInterval(refresh, refreshInterval)

  return { stock, isUp, color, loading, refresh }
}
