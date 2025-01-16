<script lang="ts" setup>
import { BaiDuStockApi } from '@/api/BaiDuStockApi'
import StockItem from '@/component/StockItem.vue'
import { useSelfSelectStock } from '@/hook/useSelfSelectStock'
import { Switch } from '@icon-park/vue-next'
import { useStorage } from '@vueuse/core'
import { delay } from '@widget-js/core'
import { useWidget, useWidgetSize, useWidgetStorage } from '@widget-js/vue3'
import { ref } from 'vue'

const { stocks, save } = useSelfSelectStock()
const { height } = useWidgetSize()
const title = useWidgetStorage('widget-title', '自选股票')
const showProfit = ref(false)
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

function switchProfit() {
  showProfit.value = !showProfit.value
}
</script>

<template>
  <widget-wrapper>
    <div class="stock-list">
      <div class="header flex">
        <div class="title">
          {{ title }}
        </div>
        <el-tooltip content="切换收益显示" placement="left-start">
          <Switch class="ml-auto cursor-pointer" size="18" @click="switchProfit" />
        </el-tooltip>
      </div>
      <el-scrollbar :height="height - 50">
        <div class="stock-data">
          <StockItem v-for="stock in stocks" :key="stock.code" :stock="stock" :profit="showProfit" />
        </div>
      </el-scrollbar>
    </div>
  </widget-wrapper>
</template>

<style lang="scss" scoped>
.stock-list{
  padding: 0.8rem 0;
  color: var(--widget-color);
  .header{
    font-size: 1rem;
    font-weight: bold;
    padding-left: 0.8rem;
    padding-bottom: 0.8rem;
    padding-right: 0.8rem;
  }
}
.stock-data {
  box-sizing: border-box;
  padding: 0 0.8rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
