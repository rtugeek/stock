import type { Stock } from '@/api/BaiDuStockApi'
import { selfSelectStockRepository } from '@/data/SelfSelectStockRepository'
import { useBroadcastChannel } from '@vueuse/core'
import { onMounted, ref, toRaw, watch } from 'vue'

export function useSelfSelectStock() {
  const stocks = ref<Stock[]>([])
  const { data, post } = useBroadcastChannel({ name: 'self-select-stock' })
  onMounted(() => {
    selfSelectStockRepository.all().then((res) => {
      stocks.value = res
    })
  })

  watch(data, async () => {
    stocks.value = await selfSelectStockRepository.all()
  }, { deep: true })

  async function save(item: Stock) {
    await selfSelectStockRepository.save(item)
    stocks.value = await selfSelectStockRepository.all()
    post({
      event: 'save',
      payload: toRaw(item),
    })
  }

  async function saveAll(item: Stock[]) {
    const rawData = JSON.parse(JSON.stringify(item))
    await selfSelectStockRepository.saveAll(rawData)
    post({
      event: 'saveAll',
      payload: rawData,
    })
  }

  async function deleteStock(item: Stock) {
    await selfSelectStockRepository.remove(item.code)
    stocks.value = await selfSelectStockRepository.all()
    post({
      event: 'delete',
      payload: toRaw(item),
    })
  }

  return { stocks, deleteStock, save, saveAll }
}
