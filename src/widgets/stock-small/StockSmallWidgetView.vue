<script lang="ts" setup>
import ExchangeTag from '@/component/ExchangeTag.vue'
import StockChart from '@/component/StockChart.vue'
import { useStockQuotation } from '@/hook/useStockQuotation'
import { useWidget, useWidgetStorage } from '@widget-js/vue3'
import { ref } from 'vue'

useWidget()
const stockCode = useWidgetStorage('stock-code', '01810')
const stockChartRef = ref<InstanceType<typeof StockChart>>()
const { quotation, isUp, color } = useStockQuotation(stockCode, {
  onNewData: (data) => {
    stockChartRef.value?.update(data, isUp.value)
  },
})
</script>

<template>
  <widget-wrapper>
    <div class="stock flex flex-col">
      <div class="header">
        <div class="flex flex-col gap-2">
          {{ quotation?.basicinfos.name ?? 'Loading' }}
          <div class="info">
            <div class="flex gap-1 items-center">
              <ExchangeTag :text="quotation?.basicinfos.exchange ?? 'err'" />
              <span class="code">{{ stockCode }}</span>
              <span class="ml-auto" :style="{ color }">{{ quotation?.cur?.ratio ?? '0' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="price">
        {{ quotation?.cur?.price ?? '0' }}
      </div>
      <div id="chart" />
      <StockChart ref="stockChartRef" :is-up="isUp" />
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
