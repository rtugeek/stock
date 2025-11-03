<script lang="ts" setup>
import { type Coin, Coins, type OkxWebSocketEventData } from '@/api/CoinApi'
import { useCoinsIndexTickers } from '@/hook/useCoinsIndexTickers'
import { useWidget, useWidgetProxyConfig } from '@widget-js/vue3'
import { reactive, watch } from 'vue'

useWidget()

const latestData = reactive<OkxWebSocketEventData[]>([])
useCoinsIndexTickers(Coins, { onNewData: (data) => {
  const index = latestData.findIndex(it => it.ccy == data.ccy)
  if (index != -1) {
    latestData[index] = data
    return
  }
  latestData.push(data)
} })
const { hasProxyRule, config: proxyConfig, updateProxy } = useWidgetProxyConfig()

if (hasProxyRule.value) {
  updateProxy()
}
watch(proxyConfig, async () => {
  updateProxy()
}, { deep: true })

function getLatestData(coin: Coin) {
  return latestData.find(it => it.ccy == coin.ccy)
}

function getRate(coin: Coin) {
  const data = getLatestData(coin)
  if (!data) {
    return ''
  }
  const open24h = Number.parseFloat(data.sodUtc8)
  const rate = ((Number.parseFloat(data.last) - open24h) / open24h) * 100
  return rate > 0 ? `+${rate.toFixed(2)}%` : `${rate.toFixed(2)}%`
}

function isUp(coin: Coin): boolean {
  const data = getLatestData(coin)
  if (!data) {
    return true
  }
  const open24h = Number.parseFloat(data.sodUtc8)
  return Number.parseFloat(data.last) - open24h >= 0
}
</script>

<template>
  <widget-wrapper>
    <el-scrollbar>
      <div class="stock-data gap-3">
        <div v-for="coin in Coins" :key="coin.type" class="flex items-center gap-2 w-full">
          <div class="flex gap-2" style="width: 150px">
            <img style="width: 40px;height: 40px" :src="coin.logo">
            <div class="flex flex-col">
              <span class="stock-title flex-1">{{ coin.ccy }}</span>
              <span class="text-sm">{{ coin.name }}</span>
            </div>
          </div>
          <span class="ml-auto flex-1 text-center">＄{{ getLatestData(coin)?.last }}</span>
          <span class="flex-1 text-center rate" :class="`${isUp(coin) ? 'positive' : 'negative'}`">{{ getRate(coin) }}</span>
        </div>
      </div>
    </el-scrollbar>
  </widget-wrapper>
</template>

<style scoped>
.stock-data{
  color: var(--widget-color);
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-around;
}

.info{
  font-size: 0.7rem;
}

.stock-title{
  font-size: 1rem;
  font-weight: bold;
}

.rate{
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.positive{
  color:white;
  border-radius: 4px;
  background: #73c167;
}
.negative{
  color:white;
  background: #ff0020;
  border-radius: 4px;
}
.stock-change{
  height: 1.5rem;
  width: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;
}
</style>
