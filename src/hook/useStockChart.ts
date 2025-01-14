import type { EChartsType } from 'echarts'
import type { MaybeRef } from 'vue'
import { useStockColor } from '@/hook/useStockColor'
import * as echarts from 'echarts'
import { nextTick, onMounted } from 'vue'

export function useStockChart(domId: string, isUp: MaybeRef<boolean>) {
  let stockChart: EChartsType
  const stockColor = useStockColor(isUp)
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
        height: '40',
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

  function update(seriesData: (string | number)[]) {
    const lineColor = stockColor.color.value
    const alphaColor = stockColor.colorEnd.value
    stockChart.setOption({
      series: [
        {
          name: '价格',
          type: 'line',
          data: seriesData,
          showSymbol: false,
          itemStyle: {
            color: lineColor,
          },
          lineStyle: {
            width: 1,
          },
          markLine: {
            data: [
              { yAxis: seriesData[seriesData.length - 1] },
            ],
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
  return { update }
}
