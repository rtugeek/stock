<script setup lang="ts">
import type { EChartsType } from 'echarts'
import * as echarts from 'echarts'
import { nextTick, onMounted } from 'vue'

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
let stockChart: EChartsType
onMounted(async () => {
  await nextTick()
  stockChart = echarts.init(document.getElementById(prop.id))
  stockChart.setOption({
    title: {
      show: false,
    },
    tooltip: {
    },
    grid: {
      top: 0,
      bottom: 0,
      height: `${prop.height}`,
    },
    yAxis: {
      type: 'value',
      min: 'dataMin',
      max: 'dataMax',
      splitLine: {
        show: false,
      },
      show: false,
    },
    xAxis: {
      show: false,
      type: 'category',
    },
  })
})

function updateColor() {
  const lineColor = '#ffc85b'
  const alphaColor = 'rgba(255,200,91,0.66)'
  stockChart.setOption({
    series: [
      {
        name: '价格',
        type: 'line',
        itemStyle: {
          color: lineColor,
        },
        markLine: {
          lineStyle: {
            color: lineColor,
          },
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: lineColor,
            },
            {
              offset: 1,
              color: alphaColor,
            },
          ]),
        },
      },
    ],
  })
}

function updateStyle() {
  stockChart.setOption({
    series: [
      {
        name: '价格',
        type: 'line',
        showSymbol: false,
        lineStyle: {
          width: 1,
        },
        markLine: {
          symbol: 'none',
          label: {
            show: false,
          },
          tooltip: {
            show: false,
          },
          lineStyle: {
            type: [2, 2],
            dashOffset: 5,
            width: 1,
          },
          emphasis: {
            disabled: true,
          },
        },
      },
    ],
  })
}

function update(seriesData: (string | number)[], currentPrice: number) {
  updateStyle()
  updateColor()
  stockChart.setOption({
    series: [
      {
        name: '价格',
        type: 'line',
        data: seriesData,
        markLine: {
          data: [
            { yAxis: currentPrice },
          ],
        },
      },
    ],
  })
}

defineExpose({
  update,
})
</script>

<template>
  <div :id="id" class="chart" />
</template>

<style scoped>

</style>
