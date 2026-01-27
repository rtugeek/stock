<script lang="ts" setup>
import type { GoldStatus } from '@/widgets/gold/GoldStatus'
import { useIntervalFn, useStorage } from '@vueuse/core'
import { useWidget } from '@widget-js/vue3'
import { AxiosError } from 'axios'
import consola from 'consola'
import { computed, nextTick, onMounted, ref } from 'vue'
import { GoldApi, type GoldApiResponse } from '@/api/GoldApi'
import GoldTag from '@/component/GoldTag.vue'
import GoldChart from '@/widgets/gold/GoldChart.vue'

useWidget()
const goldChartRef = ref<InstanceType<typeof GoldChart>>()
const goldStatus = useStorage<GoldStatus>('gold-status', {
  yesterdayClosePrice: 0,
  todayClosePrice: 0,
  data: {
    times: [],
    data: [],
    min: 0,
    max: 0,
    heyue: '',
    delaystr: '',
  },
})
const goldData = useStorage<GoldApiResponse>('goldData', {
  times: [],
  data: [],
  min: 0,
  max: 0,
  heyue: '',
  delaystr: '',
})
const isUpgrade = ref(false)
useIntervalFn(async () => {
  try {
    const quotationResult = await GoldApi.quotations()
    goldData.value = quotationResult
    goldStatus.value.data = quotationResult
    consola.info('quotationResult', quotationResult)
    consola.info('当前价格', currentPrice.value)
    goldChartRef.value?.update(quotationResult.data, currentPrice.value)
    const hqsjRes = await GoldApi.hqsj()
    goldStatus.value.todayClosePrice = hqsjRes.close
    consola.info(hqsjRes)
  }
  catch (err) {
    if (err instanceof AxiosError) {
      if (err.code == 'ERR_NETWORK') {
        isUpgrade.value = true
      }
    }
  }
}, 60000, {
  immediate: true,
  immediateCallback: true,
})

onMounted(async () => {
  await nextTick()
  goldChartRef.value?.update(goldStatus.value.data.data, currentPrice.value)
})

useIntervalFn(() => {
  // GoldApi.getYesterdayClosePrice().then((it) => {
  //   goldStatus.value.yesterdayClosePrice = it
  //   consola.info('昨日收盘价', it)
  // })
}, 30000, {
  immediate: true,
  immediateCallback: true,
})

const currentPrice = computed<number>(() => {
  const data = goldData.value?.data
  if (data && data.length > 0) {
    const times = goldData.value!.delaystr.split(' ')[1].split(':')
    const delayTime = `${times[0]}:${times[1]}`
    let index = goldData.value!.times.findIndex(it => it == delayTime)
    consola.info('index', index)
    if (index == -1) {
      index = data.length - 1
    }
    else {
      index = index > data.length - 1 ? data.length - 1 : index
    }
    const current = data[index]
    return current
  }
  return 0
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
              <!--              <span class="ml-auto">{{ changeSign }}{{ Math.round(changeRatio * 100) / 100 }}%</span> -->
            </div>
          </div>
        </div>
      </div>
      <div class="price">
        {{ (isUpgrade && currentPrice === 0) ? '接口升级中' : currentPrice }}
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
