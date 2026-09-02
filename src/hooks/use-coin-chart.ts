import { useCallback, useRef } from 'react'
import type { EChartsType } from 'echarts'
import Color from 'color'
import * as echarts from 'echarts'

const UP_COLOR = 'rgb(95,194,93)'
const DOWN_COLOR = '#f82842'

function getColor(isUp: boolean) {
  if (isUp) {
    return {
      color: UP_COLOR,
      colorEnd: Color(UP_COLOR).alpha(0).string(),
    }
  }
  return {
    color: DOWN_COLOR,
    colorEnd: Color(DOWN_COLOR).alpha(0).string(),
  }
}

export function useCoinChart(height: number = 40) {
  const chartRef = useRef<EChartsType>()

  const refCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      chartRef.current = echarts.init(node)
      chartRef.current.setOption({
        title: {
          show: false,
        },
        tooltip: {},
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
    } else {
      chartRef.current?.dispose()
      chartRef.current = undefined
    }
  }, [height])

  const updateColor = useCallback((isUp: boolean) => {
    if (!chartRef.current) return
    const newColor = getColor(isUp)
    const lineColor = newColor.color
    const alphaColor = newColor.colorEnd
    chartRef.current.setOption({
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
  }, [])

  const updateStyle = useCallback(() => {
    if (!chartRef.current) return
    chartRef.current.setOption({
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
  }, [])

  const update = useCallback((seriesData: (string | number)[], isUp: boolean) => {
    if (!chartRef.current) return
    updateStyle()
    updateColor(isUp)
    const markLineData = seriesData[seriesData.length - 1] ?? 0
    chartRef.current.setOption({
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
  }, [updateStyle, updateColor])

  return { refCallback, update, updateColor }
}
