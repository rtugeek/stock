import { useCallback, useEffect, useState } from 'react'
import type { QuotationGroup } from '@/api/bai-du-stock-api'
import type { Quotation } from '@/model/quotation'
import { BaiDuStockApi } from '@/api/bai-du-stock-api'
import { useInterval } from './use-interval'

export function useStockQuotation(
  code: string,
  group: QuotationGroup = 'quotation_minute_ab',
  refreshInterval: number = 60000,
) {
  const [quotation, setQuotation] = useState<Quotation>()
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await BaiDuStockApi.getQuotationMinute(code, group)
      setQuotation(result)
      return result
    } finally {
      setLoading(false)
    }
  }, [code, group])

  useEffect(() => {
    refresh()
  }, [refresh])

  useInterval(refresh, refreshInterval)

  return { quotation, loading, refresh }
}
