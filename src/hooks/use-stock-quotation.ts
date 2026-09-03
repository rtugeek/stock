import { useCallback, useEffect, useRef, useState } from 'react'
import type { QuotationGroup } from '@/api/eastmoney-stock-api'
import type { Quotation } from '@/model/quotation'
import { EastMoneyStockApi } from '@/api/eastmoney-stock-api'
import { useInterval } from './use-interval'

const inflight = new Map<string, Promise<Quotation>>()

function inflightKey(code: string, group: QuotationGroup) {
  return `${code}::${group}`
}

export function useStockQuotation(
  code: string,
  group: QuotationGroup = 'quotation_minute_ab',
  refreshInterval: number = 60000,
) {
  const [quotation, setQuotation] = useState<Quotation>()
  const [loading, setLoading] = useState(false)
  const firstFetchDone = useRef(false)

  const refresh = useCallback(async () => {
    const key = inflightKey(code, group)
    const existing = inflight.get(key)
    if (existing) {
      setLoading(true)
      try {
        const result = await existing
        setQuotation(result)
        firstFetchDone.current = true
        return result
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    const promise = EastMoneyStockApi.getQuotationMinute(code, group)
    inflight.set(key, promise)

    try {
      const result = await promise
      setQuotation(result)
      firstFetchDone.current = true
      return result
    } finally {
      setLoading(false)
      if (inflight.get(key) === promise) {
        inflight.delete(key)
      }
    }
  }, [code, group])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useInterval(() => {
    if (firstFetchDone.current) {
      void refresh()
    }
  }, refreshInterval)

  return { quotation, loading, refresh }
}
