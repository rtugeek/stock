<script lang="ts" setup>
import StockColorFormItem from '@/component/StockColorFormItem.vue'
import { DEFAULT_STOCK_CODE } from '@/widgets/stock/model/StockModel'
import { useStorage } from '@vueuse/core'
import {
  useWidget,
  WidgetConfigOption,
  WidgetEditDialog,
} from '@widget-js/vue3'
import { computed } from 'vue'

const { widgetParams, save } = useWidget()
const widgetConfigOption = new WidgetConfigOption({
  title: '股票设置',
  theme: {
    backgroundColor: true,
    borderRadius: true,
    fontSize: [12, 30],
  },
})

const stockSymbols = useStorage<string>('stock_symbols', DEFAULT_STOCK_CODE)
const stockSymbolsModel = computed<string>({
  get: () => {
    return stockSymbols.value
  },
  set: (value: string) => {
    // 替换全角逗号为半角逗号
    stockSymbols.value = value.toUpperCase().replace(/，/g, ',')
  },
})
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
        <el-form-item label="股票代号">
          <el-input
            v-model="stockSymbolsModel"
            clearable
            placeholder="输入股票代号，逗号隔开"
            style="color: red;"
          />
        </el-form-item>
        <StockColorFormItem />
      </el-form>
    </template>
  </WidgetEditDialog>
</template>
