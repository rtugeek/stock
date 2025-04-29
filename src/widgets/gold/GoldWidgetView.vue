<script lang="ts" setup>
import { GoldApi, type GoldApiResponse } from '@/api/GoldApi'
import GoldTag from '@/component/GoldTag.vue'
import GoldChart from '@/widgets/gold/GoldChart.vue'
import { useIntervalFn } from '@vueuse/core'
import { useWidget } from '@widget-js/vue3'
import consola from 'consola'
import { computed, ref } from 'vue'

useWidget()
const goldChartRef = ref<InstanceType<typeof GoldChart>>()
const yesterdayClosePrice = ref(0)
const goldData = ref<GoldApiResponse>()
useIntervalFn(() => {
  GoldApi.quotations().then((it) => {
    goldData.value = it
    goldChartRef.value?.update(it.data, currentPrice.value)
    consola.info(it)
  })
}, 60000, {
  immediate: true,
  immediateCallback: true,
})

useIntervalFn(() => {
  GoldApi.getYesterdayClosePrice().then((it) => {
    yesterdayClosePrice.value = it
    consola.info('昨日收盘价', it)
  })
}, 30000, {
  immediate: true,
  immediateCallback: true,
})

const currentPrice = computed<number>(() => {
  const data = goldData.value?.data
  if (data) {
    const times = goldData.value!.delaystr.split(' ')[1].split(':')
    const delayTime = `${times[0]}:${times[1]}`
    const index = goldData.value!.times.findIndex(it => it == delayTime)
    return data[index]
  }
  return 0
})

const changeRatio = computed(() => {
  const data = goldData.value?.data
  if (data && yesterdayClosePrice.value) {
    return ((currentPrice.value - yesterdayClosePrice.value) / yesterdayClosePrice.value) * 100
  }
  return 0
})

const isUp = computed(() => {
  return changeRatio.value > 0
})
</script>

<template>
  <widget-wrapper>
    <div class="stock flex flex-col">
      <div class="header">
        <div class="flex flex-col gap-2">
          黄金价格
          <div class="info">
            <div class="flex gap-1 items-center">
              <GoldTag text="AU99.99" />
              <span class="ml-auto">{{ isUp ? '+' : '-' }}{{ Math.round(changeRatio * 100) / 100 }}%</span>
            </div>
          </div>
        </div>
      </div>
      <div class="price">
        {{ currentPrice }}
      </div>
      <div id="chart" />
      <GoldChart ref="goldChartRef" />
    </div>
  </widget-wrapper>
</template>

<style scoped>
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
    font-size: 2rem;
    font-weight: normal;
  }

  #chart{
    width: 100%;
    height: calc(var(--widget-inner-height) - 2rem);
  }
}
</style>
