<script lang="ts" setup>
import { useWidget, useWidgetProxyConfig, WidgetConfigOption } from '@widget-js/vue3'

const { widgetParams } = useWidget()

// 修改成需要设置组件参数配置
const widgetConfigOption = new WidgetConfigOption({
  theme: {
    backgroundColor: true,
    borderRadius: true,
    color: true,
  },
})

const { config: proxyConfig } = useWidgetProxyConfig()
</script>

<template>
  <widget-edit-dialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
  >
    <template #custom>
      <WidgetProxyField v-model:host="proxyConfig.host" v-model:protocol="proxyConfig.protocol" v-model:port="proxyConfig.port" :label-width="100" />
    </template>
  </widget-edit-dialog>
</template>

<style scoped></style>
