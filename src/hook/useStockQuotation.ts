import type { QuotationGroup } from '@/api/BaiDuStockApi'
import type { Quotation } from '@/api/Qutation'
import type { MaybeRef, Ref } from 'vue'
import { BaiDuStockApi } from '@/api/BaiDuStockApi'
import { useStockColor } from '@/hook/useStockColor'
import { useIntervalFn, watchThrottled } from '@vueuse/core'
import consola from 'consola'
import { ref } from 'vue'

export function useStockQuotation(code: Ref<string>, option?: UseStockQuotationOption) {
  const quotation = ref<Quotation>()
  const isUp = ref(false)
  const stockColor = useStockColor(isUp)
  async function refresh() {
    consola.info('refreshing')
    const result = await BaiDuStockApi.getQuotationMinute(code.value, option?.group)
    quotation.value = result
    isUp.value = result.cur.ratio.includes('+')
    const marketData = result.newMarketData.marketData
    const data = marketData[marketData.length - 1]
    const seriesData: (string | number)[] = []
    for (const mapElement of data.p.split(';').map(it => it.split(','))) {
      seriesData.push(mapElement[2])
    }
    option?.onNewData?.(seriesData)
    return seriesData
  }

  watchThrottled(code, () => {
    refresh()
  }, {
    throttle: 1000,
    immediate: true,
  })

  useIntervalFn(refresh, option?.refreshInterval ?? 60 * 1000)
  return { quotation, isUp, color: stockColor.color }
}

export interface UseStockQuotationOption {
  refreshInterval?: MaybeRef<number>
  onNewData?: (data: (string | number)[]) => void
  group?: QuotationGroup
}
