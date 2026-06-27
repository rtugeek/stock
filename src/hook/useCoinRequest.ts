import type { MaybeRef, Ref } from 'vue'
import type { QuotationGroup } from '@/api/BaiDuStockApi'
import { useIntervalFn, useStorage, watchThrottled } from '@vueuse/core'
import { ref } from 'vue'
import { type Coin, CoinApi } from '@/api/CoinApi'

export function useCoinRequest(coin: Ref<Coin>, option?: UseCoinRequestOption) {
  const data = ref<string[][]>()
  const loading = ref(false)
  const started = ref(false)
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

  watchThrottled(coin, () => {
    if (!started.value) {
      return
    }
    refresh()
  }, {
    throttle: 5000,
    immediate: false,
  })

  useIntervalFn(() => {
    if (!started.value) {
      return
    }
    refresh()
  }, option?.refreshInterval ?? defaultRefreshInterval.value)

  const start = async () => {
    if (started.value) {
      return
    }
    started.value = true
    await refresh()
  }

  return { data, loading, refresh, start }
}

export interface UseCoinRequestOption {
  refreshInterval?: MaybeRef<number>
  onNewData?: (quotation: string[][]) => void
  group?: QuotationGroup
}
