<script setup lang="ts">
import { useCoinChart } from '@/hook/useCoinChart'

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
const stockChart = useCoinChart(prop.id, prop.height)
defineExpose({
  update: stockChart.update,
  updateColor: stockChart.updateColor,
})
</script>

<template>
  <div :id="id" class="chart" />
</template>

<style scoped>
</style>
