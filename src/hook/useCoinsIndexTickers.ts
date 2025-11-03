import type {
  Coin,
  OkxWebSocketEvent,
  OkxWebSocketEventData,
  OkxWebSocketOp,
  OkxWebSocketOpArg,
} from '@/api/CoinApi'
import { useWebSocket } from '@vueuse/core'
import consola from 'consola'
import { type MaybeRef, toValue } from 'vue'
import { ref } from 'vue'

export interface UseCoinsIndexTickersOptions {
  onNewData?: (data: OkxWebSocketEventData) => void
}
export function useCoinsIndexTickers(coins: MaybeRef<Coin[]>, options?: UseCoinsIndexTickersOptions) {
  const loading = ref(false)
  useWebSocket('wss://wspri.okx.com:8443/ws/v5/ipublic', {
    autoReconnect: true,
    onConnected: (ws) => {
      const args = toValue(coins).map((it) => {
        const data: OkxWebSocketOpArg = {
          channel: 'cup-tickers-3s',
          ccy: it.ccy!,
        }
        return data
      })
      const subMsg: OkxWebSocketOp = {
        op: 'subscribe',
        args,
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
          options?.onNewData?.(newData)
        }
      }
    },
  })

  return { loading }
}
