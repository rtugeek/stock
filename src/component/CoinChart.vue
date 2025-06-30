<script setup lang="ts">
import { useStockChart } from '@/hook/useStockChart'

const prop = defineProps({
  id: {
    type: String,
    default: 'chart',
  },
  height: {
    type: Number,
    default: 40,
  },
})
const stockChart = useStockChart(prop.id, prop.height)
defineExpose({
  update: stockChart.update,
})
</script>

<template>
  <div :id="id" class="chart" />
</template>

<style scoped>
</style>
