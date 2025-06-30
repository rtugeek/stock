import { CoinApi, type CoinType, type IndexTicker } from '@/api/CoinApi'
import { useStockColor } from '@/hook/useStockColor'
import { useIntervalFn, useStorage, watchThrottled } from '@vueuse/core'
import consola from 'consola'
import { computed, type Ref } from 'vue'
import { ref } from 'vue'

export function useCoinIndexTickers(code: Ref<CoinType>) {
  const data = ref<IndexTicker>()
  const isUp = ref(false)
  const loading = ref(false)
  const { color } = useStockColor(isUp)
  const defaultRefreshInterval = useStorage('coin_refresh_interval', 60000)

  async function refresh() {
    consola.info('refreshing')
    loading.value = true
    try {
      const result = await CoinApi.getIndexTickers(code.value)
      data.value = result[0]
      isUp.value = Number.parseFloat(data.value?.idxPx ?? '0') >= Number.parseFloat(data.value?.open24h ?? '0')
    }
    catch (e) {
      console.error(e)
    }
    finally {
      loading.value = false
    }
  }

  const rate = computed(() => {
    const idxPx = Number.parseFloat(data.value?.idxPx ?? '0')
    const open24h = Number.parseFloat(data.value?.open24h ?? '0')
    return (idxPx - open24h) / open24h * 100
  })

  const rateText = computed(() => {
    if (rate.value >= 0) {
      return `+${rate.value.toFixed(2)}%`
    }
    else {
      return `${rate.value.toFixed(2)}%`
    }
  })

  watchThrottled(code, () => {
    refresh()
  }, {
    throttle: 1000,
    immediate: true,
  })

  useIntervalFn(refresh, defaultRefreshInterval)
  return { data, isUp, color, loading, rateText, rate }
}
