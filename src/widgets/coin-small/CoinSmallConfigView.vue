<script lang="ts" setup>
import { Coins } from '@/api/CoinApi'
import { useWidget, useWidgetProxyConfig, useWidgetStorage, WidgetConfigOption } from '@widget-js/vue3'

const { widgetParams } = useWidget()
const coin = useWidgetStorage('coin-code', 'BTC-USD')
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
      <el-form label-width="100">
        <el-form-item label="虚拟币">
          <el-select v-model="coin">
            <el-option v-for="coin in Coins" :key="coin.type" :value="coin.type" :label="coin.name">
              <div class="flex items-center gap-2">
                <el-avatar size="small" :src="coin.logo" />
                {{ coin.name }}
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <WidgetProxyField v-model:host="proxyConfig.host" v-model:protocol="proxyConfig.protocol" v-model:port="proxyConfig.port" :label-width="100" />
      </el-form>
    </template>
  </widget-edit-dialog>
</template>

<style scoped></style>
