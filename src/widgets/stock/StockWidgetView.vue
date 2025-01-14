<script lang="ts" setup>
import StockItem from '@/component/StockItem.vue'
import { useStockApi } from '@/hook/useStockApi'
import { DEFAULT_STOCK_CODE } from '@/widgets/stock/model/StockModel'
import { Refresh } from '@icon-park/vue-next'
import { useStorage } from '@vueuse/core'
import { useWidget, useWidgetSize, useWidgetTheme } from '@widget-js/vue3'

const symbols = useStorage('stock_symbols', DEFAULT_STOCK_CODE)
const { displayStockData, loading } = useStockApi(symbols)
useWidget()
const { height } = useWidgetSize()
useWidgetTheme()
</script>

<template>
  <widget-wrapper>
    <div class="stock-list">
      <el-scrollbar :height="height - 18">
        <div class="stock-data flex flex-col gap-3">
          <Refresh v-show="loading" class="loading" />
          <StockItem v-for="stock in displayStockData" :key="stock.code" :stock="stock" />
        </div>
      </el-scrollbar>
    </div>
  </widget-wrapper>
</template>

<style>
.stock-list{
padding: 0.8rem 0;
}
.stock-data {
  box-sizing: border-box;
  padding: 0 0.8rem;
  overflow: hidden;
  color: var(--widget-color);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading {
  color: var(--widget-color);
  font-size: 18px;
  position: absolute;
  top: 12px;
  right: 12px;
  transform-origin: 50% 50%;
  display: flex;
  animation: infinite 1s linear spin;
}
</style>
