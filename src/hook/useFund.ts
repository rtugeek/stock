import type { Stock } from '@/model/Stock'
import type { MaybeRef, Ref } from 'vue'
import { BaiDuStockApi } from '@/api/BaiDuStockApi'
import { useStockColor } from '@/hook/useStockColor'
import { useIntervalFn, watchThrottled } from '@vueuse/core'
import consola from 'consola'
import { ref } from 'vue'

export function useFund(code: Ref<string>, option?: UseFundOptions) {
  const isUp = ref(false)
  const stockColor = useStockColor(isUp)
  async function refresh() {
    consola.info('refreshing')
    const result = await BaiDuStockApi.getFund(code.value)
    isUp.value = result?.increase?.includes('+') ?? false
  }

  watchThrottled(code, () => {
    refresh()
  }, {
    throttle: 1000,
    immediate: true,
  })

  useIntervalFn(refresh, option?.refreshInterval ?? 60 * 1000)
  return { isUp, color: stockColor.color }
}

export interface UseFundOptions {
  refreshInterval?: MaybeRef<number>
  onNewData: (stock: Stock) => void
}
