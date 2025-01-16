<script lang="ts" setup>
import { BaiDuStockApi } from '@/api/BaiDuStockApi'
import StockItem from '@/component/StockItem.vue'
import { useSelfSelectStock } from '@/hook/useSelfSelectStock'
import { useStorage } from '@vueuse/core'
import { delay } from '@widget-js/core'
import { useWidget, useWidgetSize } from '@widget-js/vue3'

const { stocks, save } = useSelfSelectStock()
const { height } = useWidgetSize()
useWidget()

const stockInit = useStorage('stock-init-4', false)
async function init() {
  if (!stockInit.value) {
    const codes = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', '01810', '00700']
    for (const code of codes) {
      const stock = await BaiDuStockApi.getStock(code)
      if (stock) {
        await save(stock)
      }
      await delay(1000)
    }
    stockInit.value = true
  }
}
init()
</script>

<template>
  <widget-wrapper>
    <div class="stock-list">
      <el-scrollbar :height="height - 18">
        <div class="stock-data">
          <StockItem v-for="stock in stocks" :key="stock.code" :stock="stock" />
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
</style>
