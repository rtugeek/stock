import type { MaybeRef } from 'vue'
import Color from 'color'
import { computed, toValue } from 'vue'

export function useStockColor(isUp: MaybeRef<boolean>) {
  const downColor = 'rgb(95,194,93)'
  const upColor = '#ff0020'
  const color = computed(() => {
    if (toValue(isUp)) {
      return upColor
    }
    else {
      return downColor
    }
  })

  const colorEnd = computed(() => {
    return Color(color.value).alpha(0).string()
  })

  return { color, colorEnd }
}
