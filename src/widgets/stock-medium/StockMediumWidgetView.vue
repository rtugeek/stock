<script lang="ts" setup>
import ExchangeTag from '@/component/ExchangeTag.vue'
import { useStockIndexApi } from '@/hook/useStockIndexApi'
import { useStorage } from '@vueuse/core'
import { useWidget } from '@widget-js/vue3'
import { ref } from 'vue'

useWidget()
const codes = ref('000001,399001,399006')
const { displayStockData } = useStockIndexApi(codes)
const stockColor = useStorage('stock_color', 0)
</script>

<template>
  <widget-wrapper>
    <div class="stock-data">
      <div v-for="stock in displayStockData" :key="stock.code" class="stock-item flex items-center gap-2">
        <div class="flex flex-col justify-between gap-1">
          <span class="stock-title flex-1">{{ stock.name }}</span>
          <div class="info flex gap-1 items-center justify-center">
            <ExchangeTag :text=" stock.exchange " />
            {{ stock.code }}
          </div>
        </div>
        <span class="stock-price ml-auto">{{ stock.price }}</span>
        <span v-if="stock.status === '1'" class="stock-change positive" :class="{ china: stockColor == 0 }">
          {{ stock.ratio }}
        </span>
        <span v-if="stock.status === '-1'" class="stock-change negative" :class="{ china: stockColor == 0 } ">
          {{ stock.ratio }}
        </span>
      </div>
    </div>
  </widget-wrapper>
</template>

<style scoped>
.stock-data{
  color: var(--widget-color);
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-around;
  height: var(--widget-inner-height);
}

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
.positive{
  color:white;
  border-radius: 4px;
  background: #ff0020;
}
.negative{
  color:white;
  background: #73c167;
  border-radius: 4px;
}
.stock-change{
  height: 1.5rem;
  width: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;
}
</style>
