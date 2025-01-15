<script setup lang="ts">
import { BaiDuStockApi, type Stock } from '@/api/BaiDuStockApi'
import { ref, toRaw } from 'vue'

const emits = defineEmits(['select'])
const keyword = ref('')
const loading = ref(false)
const options = ref<Stock[]>([])
function search(query: string) {
  if (query) {
    loading.value = true
    BaiDuStockApi.selfSelect(query).then((res) => {
      const stocks = res.Result.stock.filter(it => it.type == 'stock')
      options.value = stocks
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
  keyword.value = ''
}
</script>

<template>
  <el-select
    v-model="keyword"
    filterable
    remote
    reserve-keyword
    placeholder="请输入股票代码或名称"
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
