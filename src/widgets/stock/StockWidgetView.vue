<script lang="ts" setup>
import { useStockApi } from '@/hook/useStockApi'
import { DEFAULT_STOCK_CODE } from '@/widgets/stock/model/StockModel'
import { Refresh } from '@icon-park/vue-next'
import { useStorage } from '@vueuse/core'
import { useWidget, useWidgetTheme } from '@widget-js/vue3'
import { computed } from 'vue'

const symbols = useStorage('stock_symbols', DEFAULT_STOCK_CODE)
const { displayStockData, loading } = useStockApi(symbols)
const { sizeStyle } = useWidget()
const stockColor = useStorage('stock_color', 0)
const stockTitle = useStorage('stock_title', 0)
const titleProp = computed(() => {
  return stockTitle.value === 0 ? 'code' : 'name'
})
useWidgetTheme()
</script>

<template>
  <widget-wrapper>
    <el-scrollbar :height="sizeStyle.height">
      <div class="stock-data flex flex-col">
        <Refresh v-show="loading" class="loading" />
        <div v-for="stock in displayStockData" :key="stock.code" class="stock-item flex">
          <span class="stock-title flex-1">{{ stock[titleProp] }}</span>
          <span class="stock-price flex-1">{{ stock.price }}</span>
          <span v-if="stock.status === '1'" class="stock-change positive" :class="{ china: stockColor == 0 }">
            <i class="fas fa-arrow-up" /> {{ stock.ratio }}
          </span>
          <span v-else class="stock-change negative" :class="{ china: stockColor == 0 } ">
            <i class="fas fa-arrow-down" /> {{ stock.ratio }}
          </span>
        </div>
      </div>
    </el-scrollbar>
  </widget-wrapper>
</template>

<style>
.stock-data {
  box-sizing: border-box;
  /*width: 80%;*/
  /*background-color: #2b2b2b;*/
  /*border-radius: 15px;*/
  padding: 6px 12px;
  overflow: hidden;
  /*box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);*/
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--widget-border-color);
  height: 6px;
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-title {
  font-weight: bold;
  color: rgb(181, 151, 115);
}

.stock-price {
  color: #f0f0f0;
}

.stock-change {
  display: flex;
  align-items: center;
}

.stock-change i {
  margin-right: 5px;
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

.stock-change.positive.china {
  color: #ff6262;
}

.stock-change.negative.china {
  color: #64ff6b;
}

.stock-change.positive {
  color: #64ff6b;
}

.stock-change.negative {
  color: #ff6464;
}
</style>
