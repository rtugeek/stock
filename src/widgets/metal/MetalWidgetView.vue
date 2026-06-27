<!--
这个组件用于显示国际黄金，白银，铜，铂金价格
api_center 的id 为 info-way-common-data,
要求：每分钟从api_center获取一次id为info-way-common-data的数据

response 内容如下 {"ret":200,"msg":"success","traceId":"254213f3-0c56-4bef-9853-f8891c3961c3","data":[{"s":"XPTUSD","respList":[{"t":"1769472000","h":"2716.20400","o":"2546.01600","l":"2516.14100","c":"2703.43800","v":"97835.0","vw":"257427155.7710","pc":"6.48%","pca":"164.48800"}]},{"s":"XAGUSD","respList":[{"t":"1769472000","h":"113.49500","o":"104.75895","l":"104.35510","c":"112.96240","v":"240843.0","vw":"26320832.127850","pc":"8.90%","pca":"9.23495"}]},{"s":"XAUUSD","respList":[{"t":"1769472000","h":"5100.84000","o":"5035.79500","l":"5013.87500","c":"5090.43500","v":"392412.0","vw":"1987907800.2590","pc":"1.63%","pca":"81.56000"}]},{"s":"XCUUSD","respList":[{"t":"1769472000","h":"5.88732","o":"5.85405","l":"5.80848","c":"5.87149","v":"42672.0","vw":"249427.592650","pc":"0.40%","pca":"0.02367"}]}]}

获取到后将数据分成4块显示在界面上

api_center id为info-way-common-latest-trade的记录存储了最新价格，存储的内容如下
{"ret":200,"msg":"success","traceId":"2d12e659-11ee-4db7-9837-21fef060deee","data":[{"s":"XPTUSD","t":1769507827493,"p":"2660.97400","v":"1.0","vw":"2660.9740","td":0},{"s":"XAGUSD","t":1769507827821,"p":"112.43155","v":"1.0","vw":"112.431550","td":0},{"s":"XAUUSD","t":1769507827821,"p":"5094.07000","v":"1.0","vw":"5094.070","td":0},{"s":"XCUUSD","t":1769507827493,"p":"5.85152","v":"1.0","vw":"5.851520","td":0}]}
-->
<script lang="ts" setup>
import { useWidget } from '@widget-js/vue3'
import { onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '@/api/supabase'

useWidget()

const metals = ref<MetalInfo[]>([])
const latestPrices = ref<Record<string, string>>({})
// `initing` indicates the initial loading state. It should only show the "加载中..."
// UI for the very first load. Subsequent updates won't toggle it on.
const initing = ref(true)
const error = ref('')

async function fetchMetalData() {
  error.value = ''
  try {
    const { data, error: dbError } = await supabase
      .from('api_center')
      .select('response')
      .eq('id', 'info-way-common-data')
      .order('create_time', { ascending: false })
      .limit(1)
      .single()
    if (dbError) { throw dbError }
    if (!data?.response) { throw new Error('No response data') }
    const resp = JSON.parse(data.response)
    // 按照 黄金, 白银, 铜, 铂金 排序
    const order = ['XAUUSD', 'XAGUSD', 'XCUUSD', 'XPTUSD']
    // 先获取最新价映射
    const priceMap = latestPrices.value
    metals.value = resp.data.slice().sort((a: any, b: any) => {
      return order.indexOf(a.s) - order.indexOf(b.s)
    }).map((item: any) => {
      const respItem = item.respList && item.respList.length ? item.respList[0] : null
      return {
        name: metalNames[item.s] || item.s,
        code: item.s,
        currentPrice: priceMap[item.s] ? Number(priceMap[item.s]) : (respItem ? Number(respItem.c) : 0),
        changeAmount: respItem ? Number(respItem.pca) : 0,
        changePercent: respItem.pc,
      } as MetalInfo
    })
  }
  catch (e: any) {
    error.value = e.message || '加载失败'
    metals.value = []
  }
  finally {
    // Only end the initial loading state; subsequent fetches will not set `initing` true,
    // so this line makes sure the initial "加载中..." disappears after the first run.
    initing.value = false
  }
}

async function fetchMetalLatestPrices() {
  try {
    const { data, error: dbError } = await supabase
      .from('api_center')
      .select('response')
      .eq('id', 'info-way-common-latest-trade')
      .order('create_time', { ascending: false })
      .limit(1)
      .single()
    if (dbError) { throw dbError }
    if (!data?.response) { throw new Error('No response data') }
    const resp = JSON.parse(data.response)
    const priceMap: Record<string, string> = {}
    for (const item of resp.data) {
      priceMap[item.s] = item.p
    }
    latestPrices.value = priceMap
    // 价格更新后，重新构建 metals
    fetchMetalData()
  }
  catch (e) {
    // 不影响主界面显示
    latestPrices.value = {}
    // If the initial fetch fails, ensure the initial loading indicator is cleared so UI won't be stuck.
    initing.value = false
  }
}

let timer: number | undefined
onMounted(() => {
  fetchMetalLatestPrices()
  timer = window.setInterval(() => {
    fetchMetalLatestPrices()
  }, 60000)
})
onUnmounted(() => {
  if (timer) { window.clearInterval(timer) }
})

export interface MetalInfo {
  name: string
  code: string
  currentPrice: number
  changeAmount: number
  changePercent: string
}
const metalNames: Record<string, string> = {
  XAUUSD: 'Gold',
  XAGUSD: 'Silver',
  XCUUSD: 'Copper',
  XPTUSD: 'Platinum',
}
</script>

<template>
  <widget-wrapper>
    <el-scrollbar>
      <div class="metal-data">
        <template v-if="initing">
          加载中...
        </template>
        <template v-else-if="error">
          {{ error }}
        </template>
        <template v-else>
          <div class="metal-list">
            <div v-for="item in metals" :key="item.code" class="metal-item flex gap-2">
              <div class="flex flex-col justify-between gap-1 items-start">
                <span class="metal-title flex-1">{{ item.name }}</span>
                <div class="label" :class="`${item.code}`">
                  {{ item.code.replace('USD', '').toUpperCase() }}
                </div>
              </div>
              <div class="metal-price ml-auto">
                ${{ item.currentPrice ? item.currentPrice.toFixed(2) : '--' }}
              </div>
              <div v-if="item.changeAmount > 0" class="metal-change positive">
                +{{ item.changePercent }}
              </div>
              <div v-else-if="item.changeAmount < 0" class="metal-change negative">
                {{ item.changePercent }}
              </div>
              <div v-else class="metal-change neutral">
                {{ item.changePercent }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-scrollbar>
  </widget-wrapper>
</template>

<style scoped lang="scss">
.metal-data {
  color: var(--widget-color);
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem;
  width: 100%;
  box-sizing: border-box;
  height: var(--widget-inner-height);
}

.label{
  font-size: 0.7rem;
  padding: 0 4px;
  border-radius: 4px;
  &.XAUUSD{
    background-color: #FFD700;
    color: #1a1600;
  }

  &.XAGUSD{
    background-color: #C0C0C0;
    color: #1b1b1b;
  }

  &.XCUUSD{
    background-color: #B87333;
    color: #190f07;
  }

  &.XPTUSD{
    background-color: #E5E4E2;
    color: black;
  }
}

.metal-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.metal-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metal-title {
  font-size: 1rem;
  font-weight: bold;
}
.metal-price {
  font-size: 1rem;
}
.positive {
  color: white;
  border-radius: 4px;
  background: #ff0020;
}
.negative {
  color: white;
  background: #73c167;
  border-radius: 4px;
}
.neutral {
  color: #888;
  background: #eee;
  border-radius: 4px;
}
.metal-change {
  height: 1.5rem;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;
}
</style>
