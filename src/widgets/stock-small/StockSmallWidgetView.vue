<script lang="ts" setup>
import type { Quotation } from '@/api/Qutation'
import { BaiDuStockApi } from '@/api/BaiDuStockApi'
import ExchangeTag from '@/component/ExchangeTag.vue'
import { useStockChart } from '@/hook/useStockChart'
import { useStockColor } from '@/hook/useStockColor'
import { useIntervalFn, watchThrottled } from '@vueuse/core'
import { useWidget, useWidgetStorage } from '@widget-js/vue3'
import consola from 'consola'
import { ref } from 'vue'

useWidget()
const stockCode = useWidgetStorage('stock-code', '01810')
const stock = ref<Quotation>()
const isUp = ref(false)
const stockColor = useStockColor(isUp)
const stockChart = useStockChart('chart', isUp)
const refreshInterval = ref(60 * 1000)
function refresh() {
  consola.info('refreshing')
  BaiDuStockApi.getQuotationMinute(stockCode.value).then((res) => {
    stock.value = res
    isUp.value = res.cur.ratio.includes('+')

    const marketData = res.newMarketData.marketData
    const data = marketData[marketData.length - 1]
    const seriesData = []
    for (const mapElement of data.p.split(';').map(it => it.split(','))) {
      seriesData.push(mapElement[2])
    }
    stockChart.update(seriesData)
  })
}

watchThrottled(stockCode, () => {
  refresh()
}, {
  throttle: 1000,
  immediate: true,
})

useIntervalFn(refresh, refreshInterval)
</script>

<template>
  <widget-wrapper>
    <div class="stock flex flex-col">
      <div class="header">
        <div class="flex flex-col gap-2">
          {{ stock?.basicinfos.name ?? 'Loading' }}
          <div class="info">
            <div class="flex gap-1 items-center">
              <ExchangeTag :text="stock?.basicinfos.exchange ?? 'err'" />
              <span class="code">{{ stockCode }}</span>
              <span class="ml-auto" :style="{ color: stockColor.color.value }">{{ stock?.cur?.ratio ?? '0' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="price">
        {{ stock?.cur?.price ?? '0' }}
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
    padding: 0.1rem 1rem;
    font-size: 2rem;
    font-weight: normal;
  }

  #chart{
    width: 100%;
    height: calc(var(--widget-inner-height) - 2rem);
  }
}
</style>
