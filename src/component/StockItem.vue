<script setup lang="ts">
import type { Stock } from '@/model/Stock'
import ExchangeTag from '@/component/ExchangeTag.vue'
import StockChart from '@/component/StockChart.vue'
import { useSelfSelectStock } from '@/hook/useSelfSelectStock'
import { useStockColor } from '@/hook/useStockColor'
import { useStockQuotation } from '@/hook/useStockQuotation'
import { computed, type PropType, ref } from 'vue'

const props = defineProps({
  stock: {
    type: Object as PropType<Stock>,
    required: true,
  },
  profit: {
    type: Boolean,
  },
})
const stockChartRef = ref<InstanceType<typeof StockChart>>()
const chartId = computed(() => {
  return `chart_${props.stock.code}`
})
const code = ref(props.stock.code)
const selectStock = useSelfSelectStock()
const { isUp, color } = useStockQuotation(code, { onNewData: (quotation, data) => {
  const stock = JSON.parse(JSON.stringify(props.stock))
  stock.increase = quotation.cur.increase
  stock.price = quotation.cur.price
  stock.ratio = quotation.cur.ratio
  stock.amount = quotation.cur.amount
  stock.volume = quotation.cur.volume
  selectStock.save(stock)
  stockChartRef.value?.update(data, isUp.value)
}, group: props.stock.type == 'index' ? 'quotation_index_fiveday' : 'quotation_minute_ab' })

const currentPrice = computed<number>(() => {
  return Number.parseFloat(props.stock.price)
})

const hasHoldingInfo = computed(() => {
  return props.stock.holdingShares && props.stock.holdingPrice
})

const profitMoney = computed(() => {
  if (hasHoldingInfo.value) {
    return (currentPrice.value * props.stock.holdingShares! - props.stock.holdingPrice! * props.stock.holdingShares!)
  }
  else {
    return 0
  }
})
const { color: ProfitColor } = useStockColor(profitMoney)

const profitMoneyStr = computed(() => {
  if (profitMoney.value > 0) {
    return `+${profitMoney.value.toFixed(2)}`
  }
  else if (profitMoney.value < 0) {
    return `${profitMoney.value.toFixed(2)}`
  }
  else {
    return `0.00`
  }
})

const profitRatio = computed(() => {
  if (hasHoldingInfo.value) {
    const earn = (currentPrice.value - props.stock.holdingPrice!) / props.stock.holdingPrice! * 100
    if (earn > 0) {
      return `+${earn.toFixed(2)}%`
    }
    else {
      return `${earn.toFixed(2)}%`
    }
  }
  else {
    return '0%'
  }
})
</script>

<template>
  <div class="stock-item flex items-center gap-1">
    <div class="flex flex-col justify-between gap-1">
      <div class="stock-title">
        {{ stock.name }}
      </div>
      <div class="info flex gap-1">
        <ExchangeTag :text=" stock.exchange " />
        {{ stock.code }}
      </div>
    </div>
    <StockChart :id="chartId" ref="stockChartRef" class="ml-auto" :height="25" />
    <span v-show="profit" class="stock-price">{{ profitMoneyStr }}</span>
    <span v-show="!profit" class="stock-price">{{ currentPrice.toFixed(2) }}</span>
    <span v-show="profit" class="stock-change" :style="{ backgroundColor: ProfitColor }">
      {{ profitRatio }}
    </span>
    <span v-show="!profit" class="stock-change" :style="{ backgroundColor: color }">
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
  width: 7rem;
  white-space: nowrap;
  font-size: 0.9rem;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: bold;
}

.stock-change,.stock-profit{
  border-radius: 4px;
  color: white;
  height: 1.5rem;
  width: 4rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;
}

.stock-price{
  width: 3.5rem;
}

.chart{
  width: 60px;
  height: 25px;
}
</style>
