<script lang="ts" setup>
import { useWidget, useWidgetStorage, WidgetConfigOption } from '@widget-js/vue3'

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
</script>

<template>
  <widget-edit-dialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
  >
    <template #custom>
      <el-form-item label="股票代号">
        <el-input
          v-model="stockCode"
          clearable
          placeholder="输入股票代号"
        />
      </el-form-item>
    </template>
  </widget-edit-dialog>
</template>

<style scoped></style>
