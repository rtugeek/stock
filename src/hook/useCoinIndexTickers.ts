import type {
  Coin,
  OkxWebSocketEvent,
  OkxWebSocketEventData,
  OkxWebSocketOp,
} from '@/api/CoinApi'
import { useStockColor } from '@/hook/useStockColor'
import { useWebSocket } from '@vueuse/core'
import consola from 'consola'
import { computed, type Ref } from 'vue'
import { ref } from 'vue'

export function useCoinIndexTickers(coin: Ref<Coin>) {
  const data = ref<OkxWebSocketEventData>()
  const isUp = ref(false)
  const loading = ref(false)
  const { color } = useStockColor(isUp)
  useWebSocket('wss://wspri.okx.com:8443/ws/v5/ipublic', {
    autoReconnect: true,
    onConnected: (ws) => {
      const subMsg: OkxWebSocketOp = {
        op: 'subscribe',
        args: [{
          channel: 'cup-tickers-3s',
          ccy: coin.value.ccy!,
        }],
      }
      ws.send(JSON.stringify(subMsg))
      consola.info('WebSocket connected and subscribed:', subMsg)
    },
    onError: (ws, event) => {
      consola.error('WebSocket error:', event)
    },
    onMessage: (ws, event) => {
      const payload = JSON.parse(event.data) as OkxWebSocketEvent
      consola.info('event', event.data)
      if (payload && payload.data) {
        const newData = payload.data[0] as OkxWebSocketEventData
        if (newData) {
          isUp.value = Number.parseFloat(newData.last ?? '0') >= Number.parseFloat(newData.open24h ?? '0')
          data.value = newData
        }
      }
    },
  })

  const rate = computed(() => {
    const idxPx = Number.parseFloat(data.value?.last ?? '0')
    const open24h = Number.parseFloat(data.value?.open24h ?? '0')
    return (idxPx - open24h) / open24h * 100
  })

  const rateText = computed(() => {
    if (rate.value >= 0) {
      return `+${rate.value.toFixed(2)}%`
    }
    else {
      return `${rate.value.toFixed(2)}%`
    }
  })

  return { data, isUp, color, loading, rateText, rate }
}
