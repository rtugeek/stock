<script lang="ts" setup>
import { type Coin, Coins, type CoinType } from '@/api/CoinApi'
import CoinChart from '@/component/CoinChart.vue'
import ExchangeTag from '@/component/ExchangeTag.vue'
import { useCoinIndexTickers } from '@/hook/useCoinIndexTickers'
import { useCoinRequest } from '@/hook/useCoinRequest'
import { useWidget, useWidgetProxyConfig, useWidgetStorage } from '@widget-js/vue3'
import { computed, nextTick, onMounted, ref, watch, watchEffect } from 'vue'

useWidget()
const coinCode = useWidgetStorage<CoinType>('coin-code', 'BTC-USD')
const latestStatus = useWidgetStorage('latest-status', { data: [], isUp: false })
const coin = computed<Coin>(() => {
  return Coins.find(c => c.type === coinCode.value)
})
const { data: indexTickers, rateText, color, isUp, loading: indexLoading } = useCoinIndexTickers(coin)

const coinChartRef = ref<InstanceType<typeof CoinChart>>()
useCoinRequest(coin, {
  onNewData: (data) => {
    const yData = data.map(it => Number.parseFloat(it[1]))
    coinChartRef.value?.update(yData)
  },
})

onMounted(async () => {
  await nextTick()
  if (latestStatus.value) {
    coinChartRef.value?.update(latestStatus.value.data, latestStatus.value.isUp)
  }
  watchEffect(() => {
    coinChartRef.value?.updateColor(isUp.value)
  })
})

watch(coinCode, () => {
  window.location.reload()
})

const { hasProxyRule, config: proxyConfig, updateProxy } = useWidgetProxyConfig()
if (hasProxyRule.value) {
  updateProxy()
}
watch(proxyConfig, async () => {
  updateProxy()
}, { deep: true })
</script>

<template>
  <widget-wrapper>
    <div class="stock flex flex-col gap-1">
      <div class="header">
        <div class="flex flex-col gap-2">
          <div class="flex gap-1 items-center">
            <el-avatar :src="coin.logo" size="small" />{{ coin.name }}
          </div>
          <div class="info">
            <div class="flex gap-1 items-center">
              <ExchangeTag text="USD" />
              <span class="ml-auto" :style="{ color }">{{ rateText }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="indexTickers" class="price">
        {{ indexLoading ? '...' : indexTickers.last }}
      </div>
      <CoinChart ref="coinChartRef" :is-up="isUp" />
    </div>
  </widget-wrapper>
</template>

<style scoped lang="scss">
.stock{
  width: 100%;
  color: var(--widget-color);

  .header{
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: bold;
    .info{
      font-size: 0.8rem;
      font-weight: normal;
      .code{
        opacity: 0.5;
      }
    }
  }

  .price{
    padding: 0.1rem 1rem;
    font-size: 1.5rem;
    font-weight: normal;
  }

  #chart{
    width: 100%;
    height: calc(var(--widget-inner-height) - 1.5rem);
  }
}
</style>
