import type { QuotationGroup, StockType } from '@/api/BaiDuStockApi'
import { computed, type MaybeRef, toValue } from 'vue'

export function useQuotationGroup(stockType: MaybeRef<StockType>) {
  return computed<QuotationGroup>(() => {
    const value = toValue(stockType)
    if (value == 'fund') {
      return 'fund'
    }
    else if (value == 'index') {
      return 'quotation_index_fiveday'
    }
    else if (value == 'block') {
      return 'quotation_block_minute'
    }
    return 'quotation_minute_ab'
  })
}
