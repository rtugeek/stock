<script lang="ts" setup>
import type { Stock } from '@/model/Stock'
import RefreshIntervalFormItem from '@/component/RefreshIntervalFormItem.vue'
import StockColorFormItem from '@/component/StockColorFormItem.vue'
import StockSelect from '@/component/StockSelect.vue'
import { useSelfSelectStock } from '@/hook/useSelfSelectStock'
import SelfSelectStockItem from '@/widgets/stock/SelfSelectStockItem.vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { delay } from '@widget-js/core'
import {
  useWidget,
  useWidgetStorage,
  WidgetConfigOption,
  WidgetEditDialog,
} from '@widget-js/vue3'
import { ref } from 'vue'

const stockList = ref<HTMLElement | null>(null)
const title = useWidgetStorage('widget-title', '自选股票')
const { widgetParams, save } = useWidget()
const keyword = ref('')
const { stocks, save: saveStock, deleteStock, saveOrder } = useSelfSelectStock()
const widgetConfigOption = new WidgetConfigOption({
  title: '股票设置',
  theme: {
    backgroundColor: true,
    borderRadius: true,
    fontSize: [12, 30],
  },
})

useSortable(stockList, stocks, {
  animation: 200,
  handle: '.handler',
  onEnd: async () => {
    // 有个动画的延迟
    await delay(300)
    saveOrder(stocks.value)
  },
})

function onStockSelect(stock: Stock) {
  saveStock(stock)
  keyword.value = ''
}
</script>

<template>
  <WidgetEditDialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
    @apply="save()"
    @confirm="save({ closeWindow: true })"
  >
    <template #custom>
      <el-form label-width="70">
        <div class="flex gap-2 w-full">
          <el-form-item class="flex-1" label="组件标题">
            <el-input v-model="title" maxlength="8" />
          </el-form-item>
          <RefreshIntervalFormItem class="flex-1" />
        </div>
        <StockColorFormItem />
        <el-form-item label="添加股票">
          <StockSelect v-model="keyword" @select="onStockSelect" />
        </el-form-item>
        <h3>自选列表</h3>
        <el-scrollbar height="390">
          <div ref="stockList" class="flex flex-col gap-2">
            <div v-for="stock in stocks" :key="stock.code">
              <SelfSelectStockItem :stock="stock" @delete="deleteStock" />
            </div>
          </div>
        </el-scrollbar>
      </el-form>
    </template>
  </WidgetEditDialog>
</template>

<style lang="scss">
.handler {
  display: flex;
  justify-items: center;
  width: 2rem;
  height: 1.5rem;
  cursor: grab;
  align-items: center;
  font-size: 1rem;
  justify-content: center;
}

.i-icon {
  line-height: 1;
}

.name {
  font-weight: bold;
}
</style>
