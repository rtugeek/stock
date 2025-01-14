import type { EChartsType } from 'echarts'
import { useStockColor } from '@/hook/useStockColor'
import * as echarts from 'echarts'
import { nextTick, onMounted, watch } from 'vue'

export function useStockChart(domId: string, height: number = 40) {
  let stockChart: EChartsType
  let currentIsUp = false
  const stockColor = useStockColor()
  onMounted(async () => {
    await nextTick()
    stockChart = echarts.init(document.getElementById(domId))
    stockChart.setOption({
      title: {
        show: false,
      },
      tooltip: {
      },
      grid: {
        top: 0,
        bottom: 0,
        height: `${height}`,
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

  function updateStyle(isUp: boolean) {
    const newColor = stockColor.getColor(isUp)
    const lineColor = newColor.color
    const alphaColor = newColor.colorEnd
    stockChart.setOption({
      series: [
        {
          name: '价格',
          type: 'line',
          showSymbol: false,
          itemStyle: {
            color: lineColor,
          },
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
              color: lineColor,
              type: [2, 2],
              dashOffset: 5,
              width: 1,
            },
            emphasis: {
              disabled: true,
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

  watch(stockColor.color, () => {
    updateStyle(currentIsUp)
  })

  function update(seriesData: (string | number)[], isUp: boolean) {
    currentIsUp = isUp
    updateStyle(isUp)
    stockChart.setOption({
      series: [
        {
          name: '价格',
          type: 'line',
          data: seriesData,
          markLine: {
            data: [
              { yAxis: seriesData[seriesData.length - 1] },
            ],
          },
        },
      ],
    })
  }
  return { update }
}
