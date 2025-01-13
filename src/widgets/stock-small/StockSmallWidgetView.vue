<script lang="ts" setup>
import { BaiDuStockApi, type Stock } from '@/api/BaiDuStockApi'
import ExchangeTag from '@/component/ExchangeTag.vue'
import { useStockChart } from '@/hook/useStockChart'
import { useStockColor } from '@/hook/useStockColor'
import { useIntervalFn, watchDebounced } from '@vueuse/core'
import { useWidget, useWidgetStorage } from '@widget-js/vue3'
import consola from 'consola'
import { nextTick, onMounted, ref } from 'vue'

useWidget()
const stockCode = useWidgetStorage('stock-code', '01810')
const stock = ref<Stock>()
const latestPrice = ref('')
const latestRatio = ref('')
const isUp = ref(false)
const stockColor = useStockColor(isUp)
const stockChart = useStockChart('chart', isUp)

function refresh() {
  consola.info('refreshing')
  BaiDuStockApi.getStock(stockCode.value).then((res) => {
    stock.value = res
  })
  BaiDuStockApi.getQuotation(stockCode.value).then((res) => {
    if (res.ResultCode == 0) {
      const result = res.Result
      const marketData = result.newMarketData.marketData
      const data = marketData[marketData.length - 1]
      const x = []
      const y = []
      for (const mapElement of data.p.split(';').map(it => it.split(','))) {
        x.push(mapElement[1])
        y.push(mapElement[2])
        isUp.value = !mapElement[4].includes('-')
        latestPrice.value = mapElement[2]
        latestRatio.value = mapElement[5]
      }
      stockChart.update(y)
    }
  })
}

watchDebounced(stockCode, () => {
  refresh()
}, {
  debounce: 2000,
})

onMounted(async () => {
  await nextTick()
  refresh()
})

useIntervalFn(refresh, 60 * 1000)
</script>

<template>
  <widget-wrapper>
    <div class="stock flex flex-col">
      <div class="header">
        <div class="flex flex-col gap-2">
          {{ stock?.name ?? '加载中' }}
          <div class="info">
            <div class="flex gap-1 items-center">
              <ExchangeTag :text="stock?.exchange ?? 'err'" />
              <span class="code">{{ stockCode }}</span>
              <span class="ml-auto" :style="{ color: stockColor.color.value }">{{ stock?.ratio ?? '0.0%' }}</span>
            </div>
          </div>
          <div class="price">
            {{ latestPrice }}
          </div>
        </div>
      </div>
      <div id="chart" />
    </div>
  </widget-wrapper>
</template>

<style scoped lang="scss">
.stock{
  width: 100%;
  color: var(--widget-color);

  .header{
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: bold;
    .info{
      font-size: 0.8rem;
      font-weight: normal;
      .code{
        opacity: 0.5;
      }
    }
  }

  .price{
    font-size: 2rem;
    font-weight: normal;
  }

  #chart{
    width: 100%;
    height: calc(var(--widget-inner-height) - 2rem);
  }
}
</style>
