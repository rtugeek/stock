<script setup lang="ts">
import type { Stock } from '@/api/BaiDuStockApi'
import ExchangeTag from '@/component/ExchangeTag.vue'
import StockChart from '@/component/StockChart.vue'
import { useStockQuotation } from '@/hook/useStockQuotation'
import { computed, type PropType, ref } from 'vue'

const props = defineProps({
  stock: {
    type: Object as PropType<Stock>,
    required: true,
  },
})
const stockChartRef = ref<InstanceType<typeof StockChart>>()
const chartId = computed(() => {
  return `chart_${props.stock.code}`
})
const code = ref(props.stock.code)
const { isUp, color } = useStockQuotation(code, { onNewData: (data) => {
  stockChartRef.value?.update(data, isUp.value)
}, group: props.stock.type == 'index' ? 'quotation_index_fiveday' : 'quotation_minute_ab' })
</script>

<template>
  <div class="stock-item flex items-center gap-2">
    <div class="flex flex-col justify-between gap-1">
      <span class="stock-title flex-1">{{ stock.name }}</span>
      <div class="info flex gap-1 items-center justify-center">
        <ExchangeTag :text=" stock.exchange " />
        {{ stock.code }}
      </div>
    </div>
    <StockChart :id="chartId" ref="stockChartRef" class="ml-auto" :height="25" />
    <span class="stock-price">{{ stock.price }}</span>
    <span class="stock-change" :style="{ backgroundColor: color }">
      {{ stock.ratio }}
    </span>
  </div>
</template>

<style scoped>
.info{
  font-size: 0.7rem;
}

.stock-item{
  width: 100%;
}

.stock-title{
  font-size: 1rem;
  font-weight: bold;
}
.stock-change{
  border-radius: 4px;
  color: white;
  height: 1.5rem;
  width: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;
}

.chart{
  width: 60px;
  height: 25px;
}
</style>
