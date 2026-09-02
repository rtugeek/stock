import { useCallback, useEffect, useRef } from 'react'
import type { EChartsType } from 'echarts'
import * as echarts from 'echarts'
import { useStockColorStore } from '@/store/use-stock-color-store'

export function useStockChart(height: number = 40) {
  const chartRef = useRef<EChartsType>()
  const currentIsUpRef = useRef(false)
  const getColorByValue = useStockColorStore((state) => state.getColorByValue)
  const stockColor = useStockColorStore((state) => state.stockColor)

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
    const newColor = getColorByValue(isUp)
    const lineColor = newColor.color
    const alphaColor = newColor.colorEnd
    chartRef.current.setOption({
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
  }, [getColorByValue])

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
        },
      ],
    })
  }, [])

  useEffect(() => {
    updateColor(currentIsUpRef.current)
  }, [stockColor, updateColor])

  const update = useCallback((seriesData: number[], isUp: boolean) => {
    if (!chartRef.current) return
    currentIsUpRef.current = isUp
    updateStyle()
    updateColor(isUp)
    chartRef.current.setOption({
      series: [
        {
          name: 'price',
          type: 'line',
          data: seriesData,
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
            data: [
              { yAxis: seriesData[seriesData.length - 1] },
            ],
          },
        },
      ],
    })
  }, [updateStyle, updateColor])

  return { refCallback, update }
}
