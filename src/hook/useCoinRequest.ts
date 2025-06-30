import type { QuotationGroup } from '@/api/BaiDuStockApi'
import { type CandleData, CoinApi, type CoinType } from '@/api/CoinApi'
import { useIntervalFn, useStorage, watchThrottled } from '@vueuse/core'
import { type MaybeRef, type Ref, watch } from 'vue'
import { ref } from 'vue'

export function useCoinRequest(code: Ref<CoinType>, option?: UseStockQuotationOption) {
  const data = ref<CandleData[]>()
  const loading = ref(false)
  const defaultRefreshInterval = useStorage('coin_refresh_interval', 60000)
  watch(code, () => {
    refresh()
  })

  async function refresh() {
    loading.value = true
    try {
      const result = await CoinApi.getCandlesHistory(code.value)
      data.value = result
      // const marketData = result.newMarketData.marketData
      // const data = marketData[marketData.length - 1]
      const seriesData: (string | number)[] = []
      for (const item of data.value) {
        seriesData.push(item.c)
      }
      option?.onNewData?.(result, seriesData)
      return seriesData
    }
    catch (e) {
      console.error(e)
    }
    finally {
      loading.value = false
    }
  }

  watchThrottled(code, () => {
    refresh()
  }, {
    throttle: 5000,
    immediate: true,
  })

  useIntervalFn(refresh, option?.refreshInterval ?? defaultRefreshInterval.value)
  return { data, loading }
}

export interface UseStockQuotationOption {
  refreshInterval?: MaybeRef<number>
  onNewData?: (quotation: CandleData[], data: (string | number)[]) => void
  group?: QuotationGroup
}
