<script setup lang="ts">
import type { Stock } from '@/model/Stock'
import type { PropType } from 'vue'
import { useSelfSelectStock } from '@/hook/useSelfSelectStock'
import { HamburgerButton } from '@icon-park/vue-next'
import { useDebounceFn } from '@vueuse/core'
import { ref } from 'vue'

const props = defineProps({
  stock: {
    type: Object as PropType<Stock>,
    required: true,
  },
})

const emits = defineEmits(['delete'])
const holdingShares = ref(props.stock.holdingShares ?? 0)
const holdingPrice = ref(props.stock.holdingPrice ?? 0)
const { save } = useSelfSelectStock()
function change() {
  const stock = JSON.parse(JSON.stringify(props.stock))
  stock.holdingShares = holdingShares.value
  stock.holdingPrice = holdingPrice.value
  save(stock)
}
const debounceChange = useDebounceFn(change, 500)
</script>

<template>
  <el-card shadow="never" body-style="padding:0.5rem">
    <div class="flex items-center gap-2">
      <div class="handler">
        <HamburgerButton />
      </div>
      <div class="flex items-center gap-2">
        <div class="name">
          {{ stock.name }}
        </div>
        <div class="code">
          {{ stock.code }}
        </div>
      </div>
      <div class="ml-auto" />
      <div class="holding">
        持有份额：
        <el-input-number
          v-model="holdingShares" max="100000000" min="0" :controls="false" precision="2" size="small"
          style="width: 80px;"
          type="number" @change="debounceChange"
        />
        持仓价：
        <el-input-number
          v-model="holdingPrice" max="1000000" min="0" size="small" :controls="false" precision="2"
          style="width: 80px;"
          type="number" @change="debounceChange"
        />
      </div>
      <el-button type="danger" size="small" @click="emits('delete', stock)">
        删除
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.holding {
  font-size: 0.8rem;
}

.name {
  overflow: hidden;
  text-wrap: nowrap;
  max-width: 100px;
  text-overflow: ellipsis;
}
</style>
