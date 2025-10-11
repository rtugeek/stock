import type { EChartsType } from 'echarts'
import Color from 'color'
import * as echarts from 'echarts'
import { nextTick, onMounted } from 'vue'

export function useCoinChart(domId: string, height: number = 40) {
  let stockChart: EChartsType
  const upColor = 'rgb(95,194,93)'
  const downColor = '#f82842'

  function getColor(isUp: boolean) {
    if (isUp) {
      return {
        color: upColor,
        colorEnd: Color(upColor).alpha(0).string(),
      }
    }
    else {
      return {
        color: downColor,
        colorEnd: Color(downColor).alpha(0).string(),
      }
    }
  }

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

  function updateColor(isUp: boolean) {
    const newColor = getColor(isUp)
    const lineColor = newColor.color
    const alphaColor = newColor.colorEnd
    stockChart.setOption({
      series: [
        {
          name: 'price',
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

  function update(seriesData: (string | number)[]) {
    updateStyle()
    const markLineData = seriesData[seriesData.length - 1] ?? 0
    stockChart.setOption({
      series: [
        {
          name: '价格',
          type: 'line',
          data: seriesData,
          markLine: {
            data: [
              { yAxis: markLineData },
            ],
          },
        },
      ],
    })
  }

  return { update, updateColor }
}
