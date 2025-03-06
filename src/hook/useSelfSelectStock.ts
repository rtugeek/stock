import type { StockType } from '@/api/BaiDuStockApi'
import type { Stock } from '@/model/Stock'
import { selfSelectStockRepository } from '@/data/SelfSelectStockRepository'
import { useBroadcastChannel } from '@vueuse/core'
import { onMounted, ref, toRaw, watch, watchEffect } from 'vue'

const allStocks = ref<Stock[]>([])
const stocks = ref<Stock[]>([])
const { data, post } = useBroadcastChannel({ name: 'self-select-stock' })
export function useSelfSelectStock(types: StockType[] = ['stock', 'fund']) {
  onMounted(async () => {
    allStocks.value = await selfSelectStockRepository.all()
  })

  watchEffect(() => {
    stocks.value = allStocks.value.filter(it => types.includes(it.type))
  })

  watch(data, async () => {
    allStocks.value = await selfSelectStockRepository.all()
  }, { deep: true })

  async function save(item: Stock) {
    await selfSelectStockRepository.save(item)
    allStocks.value = await selfSelectStockRepository.all()
    post({
      event: 'save',
      payload: toRaw(item),
    })
  }

  async function saveOrder(item: Stock[]) {
    const rawData = JSON.parse(JSON.stringify(item))
    await selfSelectStockRepository.saveOrder(rawData)
    post({
      event: 'saveOrder',
      payload: rawData,
    })
  }

  async function deleteStock(item: Stock) {
    await selfSelectStockRepository.remove(item.code)
    allStocks.value = await selfSelectStockRepository.all()
    post({
      event: 'delete',
      payload: toRaw(item),
    })
  }

  return { stocks, deleteStock, save, saveOrder }
}
