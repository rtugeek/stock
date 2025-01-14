import type { MaybeRef } from 'vue'
import { useStorage } from '@vueuse/core'
import Color from 'color'
import { computed, toValue } from 'vue'

export function useStockColor(isUp?: MaybeRef<boolean>) {
  const green = 'rgb(95,194,93)'
  const red = '#f82842'
  const stockColor = useStorage('stock_color', 0)
  const upColor = computed(() => {
    return stockColor.value === 0 ? red : green
  })
  const downColor = computed(() => {
    return stockColor.value === 0 ? green : red
  })
  const color = computed(() => {
    if (toValue(isUp)) {
      return upColor.value
    }
    else {
      return downColor.value
    }
  })

  const colorEnd = computed(() => {
    return Color(color.value).alpha(0).string()
  })

  function getColor(isUp: boolean) {
    if (isUp) {
      return {
        color: upColor.value,
        colorEnd: Color(upColor.value).alpha(0).string(),
      }
    }
    else {
      return {
        color: downColor.value,
        colorEnd: Color(downColor.value).alpha(0).string(),
      }
    }
  }

  return { color, colorEnd, getColor }
}
