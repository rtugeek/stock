<script lang="ts" setup>
import { useStorage } from '@vueuse/core'
import {
  useWidget,
  WidgetConfigOption,
  WidgetEditDialog,
} from '@widget-js/vue3'

const { widgetParams, save } = useWidget()
const widgetConfigOption = new WidgetConfigOption({
  title: '股票设置',
  theme: {
    backgroundColor: true,
    borderRadius: true,
    fontSize: [12, 30],
  },
})

const stockColor = useStorage('stock_color', 0)
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
        <el-form-item label="涨跌颜色">
          <el-radio-group v-model="stockColor">
            <el-radio :value="0">
              <span class="color-red">红涨</span> <span class="color-green">绿跌</span>
            </el-radio>
            <el-radio :value="1">
              <span class="color-green">红跌</span> <span class="color-red">绿涨</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>
  </WidgetEditDialog>
</template>
