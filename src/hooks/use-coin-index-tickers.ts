import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  Coin,
  OkxWebSocketEvent,
  OkxWebSocketEventData,
  OkxWebSocketOp,
} from '@/api/coin-api'
import consola from 'consola'
import { useStockColorStore } from '@/store/use-stock-color-store'

export function useCoinIndexTickers(coin: Coin) {
  const [data, setData] = useState<OkxWebSocketEventData>()
  const [isUp, setIsUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const getColorByValue = useStockColorStore((state) => state.getColorByValue)

  const color = useMemo(() => {
    return getColorByValue(isUp).color
  }, [isUp, getColorByValue])

  const rate = useMemo(() => {
    const idxPx = Number.parseFloat(data?.last ?? '0')
    const open24h = Number.parseFloat(data?.open24h ?? '0')
    if (open24h === 0) return 0
    return (idxPx - open24h) / open24h * 100
  }, [data])

  const rateText = useMemo(() => {
    if (rate >= 0) {
      return `+${rate.toFixed(2)}%`
    }
    return `${rate.toFixed(2)}%`
  }, [rate])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setLoading(true)
    const ws = new WebSocket('wss://wspri.okx.com:8443/ws/v5/ipublic')
    wsRef.current = ws

    ws.onopen = () => {
      const subMsg: OkxWebSocketOp = {
        op: 'subscribe',
        args: [{
          channel: 'cup-tickers-3s',
          ccy: coin.ccy!,
        }],
      }
      ws.send(JSON.stringify(subMsg))
      consola.info('WebSocket connected and subscribed:', subMsg)
      setLoading(false)
    }

    ws.onerror = (event) => {
      consola.error('WebSocket error:', event)
      setLoading(false)
    }

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as OkxWebSocketEvent
      if (payload && payload.data) {
        const newData = payload.data[0] as OkxWebSocketEventData
        if (newData) {
          const lastVal = Number.parseFloat(newData.last ?? '0')
          const openVal = Number.parseFloat(newData.open24h ?? '0')
          setIsUp(lastVal >= openVal)
          setData(newData)
        }
      }
    }
  }, [coin.ccy])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { data, isUp, color, loading, rate, rateText, connect, disconnect }
}
