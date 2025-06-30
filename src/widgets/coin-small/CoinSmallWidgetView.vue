<script lang="ts" setup>
import { type Coin, Coins, type CoinType } from '@/api/CoinApi'
import CoinChart from '@/component/CoinChart.vue'
import ExchangeTag from '@/component/ExchangeTag.vue'
import { useCoinIndexTickers } from '@/hook/useCoinIndexTickers'
import { useCoinRequest } from '@/hook/useCoinRequest'
import { useWidget, useWidgetStorage } from '@widget-js/vue3'
import { computed, ref } from 'vue'

useWidget()
const coinCode = useWidgetStorage<CoinType>('coin-code', 'BTC-USD')
const { data: indexTickers, rateText, isUp, color, loading: indexLoading } = useCoinIndexTickers(coinCode)
const coin = computed<Coin>(() => {
  return Coins.find(c => c.type === coinCode.value)
})
const coinChartRef = ref<InstanceType<typeof CoinChart>>()
useCoinRequest(coinCode, {
  onNewData: (data, seriaData) => {
    coinChartRef.value?.update(seriaData, isUp.value)
  },
})
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
        {{ indexLoading ? '...' : indexTickers.idxPx }}
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
