import type { QuotationGroup } from '@/api/BaiDuStockApi'
import type { MaybeRef, Ref } from 'vue'
import { type Coin, CoinApi } from '@/api/CoinApi'
import { useIntervalFn, useStorage, watchThrottled } from '@vueuse/core'
import { ref } from 'vue'

export function useCoinRequest(coin: Ref<Coin>, option?: UseCoinRequestOption) {
  const data = ref<string[][]>()
  const loading = ref(false)
  const defaultRefreshInterval = useStorage('coin_refresh_interval', 60000)

  async function refresh() {
    loading.value = true
    try {
      const result = await CoinApi.getIndexTickers(coin.value)
      data.value = result
      option?.onNewData?.(result)
      return result
    }
    catch (e) {
      console.error(e)
    }
    finally {
      loading.value = false
    }
  }

  watchThrottled(coin.value, () => {
    refresh()
  }, {
    throttle: 5000,
    immediate: true,
  })

  useIntervalFn(refresh, option?.refreshInterval ?? defaultRefreshInterval.value)
  return { data, loading }
}

export interface UseCoinRequestOption {
  refreshInterval?: MaybeRef<number>
  onNewData?: (quotation: string[][]) => void
  group?: QuotationGroup
}
