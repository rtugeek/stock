<script lang="ts" setup>
import type { StockType } from '@/api/BaiDuStockApi'
import type { Stock } from '@/model/Stock'
import RefreshIntervalFormItem from '@/component/RefreshIntervalFormItem.vue'
import StockColorFormItem from '@/component/StockColorFormItem.vue'
import StockSelect from '@/component/StockSelect.vue'
import { useWidget, useWidgetStorage, WidgetConfigOption } from '@widget-js/vue3'
import { nextTick, onMounted, ref } from 'vue'

const { widgetParams } = useWidget()

// 修改成需要设置组件参数配置
const widgetConfigOption = new WidgetConfigOption({
  theme: {
    backgroundColor: true,
    borderRadius: true,
    color: true,
  },
})

const stockCode = useWidgetStorage('stock-code', '01810')
const stockType = useWidgetStorage<StockType>('stock-type', 'stock')
const stockLabel = useWidgetStorage<string>('stock-info', '')
const keyword = ref()

function onStockSelect(newStock: Stock) {
  stockCode.value = newStock.code
  stockType.value = newStock.type
  stockLabel.value = `${newStock.name}(${newStock.code})`
}

if (stockLabel.value) {
  keyword.value = stockLabel.value
}
onMounted(async () => {
  await nextTick()
})
</script>

<template>
  <widget-edit-dialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
  >
    <template #custom>
      <RefreshIntervalFormItem />
      <el-form-item label="搜索股票">
        <StockSelect v-model="keyword" @select="onStockSelect" />
      </el-form-item>
      <StockColorFormItem />
    </template>
  </widget-edit-dialog>
</template>

<style scoped></style>
