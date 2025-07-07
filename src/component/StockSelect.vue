<script setup lang="ts">
import type { Stock } from '@/model/Stock'
import { BaiDuStockApi, type StockType } from '@/api/BaiDuStockApi'
import { ref, toRaw } from 'vue'

const props = defineProps({
  type: {
    type: Array<StockType>,
    default: ['stock', 'fund', 'block'],
  },
})
const emits = defineEmits(['select'])
const model = defineModel<string>()
const loading = ref(false)
const options = ref<Stock[]>([])
function search(query: string) {
  if (query) {
    loading.value = true
    BaiDuStockApi.selfSelect(query).then((res) => {
      options.value = res.Result.stock.filter(it => props.type.includes(it.type))
    }).finally(() => {
      loading.value = false
    })
  }
  else {
    options.value = []
  }
}
function onChanged(value: string) {
  const find = options.value.find(it => it.code == value)
  emits('select', toRaw(find))
}
</script>

<template>
  <el-select
    v-model="model"
    filterable
    remote
    reserve-keyword
    placeholder="输入代码或名称"
    :remote-method="search"
    :loading="loading"
    style="width: 240px"
    @change="onChanged"
  >
    <el-option
      v-for="item in options"
      :key="item.code"
      :label="`${item.name}(${item.code})`"
      :value="item.code"
    />
  </el-select>
</template>

<style scoped>

</style>
