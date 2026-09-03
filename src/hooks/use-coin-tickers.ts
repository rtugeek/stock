import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  Coin,
  OkxWebSocketEvent,
  OkxWebSocketEventData,
  OkxWebSocketOp,
} from '@/api/coin-api'
import consola from 'consola'
import { useStockColorStore } from '@/store/use-stock-color-store'

export interface CoinTicker extends OkxWebSocketEventData {
  rate24h: number
  rateText: string
  isUp: boolean
  color: string
}

type WsState = 'idle' | 'connecting' | 'open'

interface SharedConnection {
  ws: WebSocket
  state: WsState
  subscriptions: Set<string>
  listeners: Map<string, (data: OkxWebSocketEventData) => void>
  heartbeat?: ReturnType<typeof setInterval>
}

let sharedConn: SharedConnection | null = null
const connectInflight: Promise<SharedConnection> | null = null

function ensureConnection(coins: Coin[]): Promise<SharedConnection> {
  if (sharedConn) {
    coins.forEach((c) => {
      if (c.ccy) sharedConn!.subscriptions.add(c.ccy)
    })
    if (sharedConn.ws.readyState === WebSocket.OPEN) {
      sendSubscribe(sharedConn, coins.filter((c) => c.ccy))
    }
    return Promise.resolve(sharedConn)
  }

  const inflightAny = connectInflight as Promise<SharedConnection> | null
  if (inflightAny) {
    return inflightAny.then((conn) => {
      coins.forEach((c) => {
        if (c.ccy) conn.subscriptions.add(c.ccy)
      })
      if (conn.ws.readyState === WebSocket.OPEN) {
        sendSubscribe(conn, coins.filter((c) => c.ccy))
      }
      return conn
    })
  }

  const ws = new WebSocket('wss://wspri.okx.com:8443/ws/v5/ipublic')
  const subscriptions = new Set<string>()
  coins.forEach((c) => c.ccy && subscriptions.add(c.ccy))

  const conn: SharedConnection = {
    ws,
    state: 'connecting',
    subscriptions,
    listeners: new Map(),
  }

  sharedConn = conn

  const connectPromise = new Promise<SharedConnection>((resolve) => {
    ws.onopen = () => {
      conn.state = 'open'
      consola.info('[CoinTickers] WebSocket connected')
      const coinList = coins.filter((c) => c.ccy)
      sendSubscribe(conn, coinList)
      startHeartbeat(conn)
      resolve(conn)
    }

    ws.onerror = (event) => {
      consola.error('[CoinTickers] WebSocket error:', event)
    }

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as OkxWebSocketEvent
        if (!payload || !payload.data || !Array.isArray(payload.data)) return
        for (const item of payload.data) {
          const ccy = (item as OkxWebSocketEventData).ccy
          if (ccy) {
            const cb = conn.listeners.get(ccy)
            cb?.(item as OkxWebSocketEventData)
          }
        }
      } catch (e) {
        consola.warn('[CoinTickers] parse message failed:', e)
      }
    }

    ws.onclose = () => {
      consola.info('[CoinTickers] WebSocket closed')
      conn.state = 'idle'
      if (conn.heartbeat) {
        clearInterval(conn.heartbeat)
        conn.heartbeat = undefined
      }
      if (sharedConn === conn) {
        sharedConn = null
      }
    }
  })

  return connectPromise
}

function sendSubscribe(conn: SharedConnection, coins: Coin[]) {
  if (coins.length === 0 || conn.ws.readyState !== WebSocket.OPEN) return
  const args = coins
    .filter((c) => c.ccy)
    .map((c) => ({
      channel: 'cup-tickers-3s' as const,
      ccy: c.ccy!,
    }))
  if (args.length === 0) return
  const subMsg: OkxWebSocketOp = {
    op: 'subscribe',
    args,
  }
  conn.ws.send(JSON.stringify(subMsg))
  consola.info('[CoinTickers] subscribed:', args.map((a) => a.ccy).join(', '))
}

function startHeartbeat(conn: SharedConnection) {
  if (conn.heartbeat) clearInterval(conn.heartbeat)
  conn.heartbeat = setInterval(() => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send('ping')
    }
  }, 20000)
}

export function useCoinTickers(coins: Coin[]) {
  const [tickers, setTickers] = useState<Record<string, CoinTicker>>({})
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(false)
  const connectedRef = useRef(false)
  const getColorByValue = useStockColorStore((state) => state.getColorByValue)
  const coinCcyList = useMemo(() => coins.map((c) => c.ccy).filter(Boolean) as string[], [coins])

  const handleData = useCallback((ccy: string, data: OkxWebSocketEventData) => {
    setTickers((prev) => {
      const lastVal = Number.parseFloat(data.last ?? '0')
      const openVal = Number.parseFloat(data.open24h ?? '0')
      const rate = openVal === 0 ? 0 : ((lastVal - openVal) / openVal) * 100
      const isUp = rate >= 0
      const colorInfo = getColorByValue(isUp)
      const next: CoinTicker = {
        ...data,
        rate24h: rate,
        rateText: `${isUp ? '+' : ''}${rate.toFixed(2)}%`,
        isUp,
        color: colorInfo.color,
      }
      if (prev[ccy] && JSON.stringify(prev[ccy]) === JSON.stringify(next)) {
        return prev
      }
      return { ...prev, [ccy]: next }
    })
    setLoading(false)
  }, [getColorByValue])

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    let active = true
    const localListeners = new Map<string, (data: OkxWebSocketEventData) => void>()

    ensureConnection(coins)
      .then((conn) => {
        if (!active) return
        connectedRef.current = true
        coins.forEach((coin) => {
          if (!coin.ccy) return
          const cb = (data: OkxWebSocketEventData) => {
            if (active) handleData(coin.ccy!, data)
          }
          localListeners.set(coin.ccy, cb)
          const existing = conn.listeners.get(coin.ccy)
          if (!existing) {
            conn.listeners.set(coin.ccy, cb)
          } else {
            conn.listeners.set(coin.ccy, (d) => {
              existing(d)
              cb(d)
            })
          }
        })
      })
      .catch((e) => {
        consola.error('[CoinTickers] connect failed:', e)
        if (active) setLoading(false)
      })

    return () => {
      active = false
      const conn = sharedConn
      if (conn) {
        localListeners.forEach((_, ccy) => {
          conn.listeners.delete(ccy)
        })
      }
    }
  }, [coins, handleData])

  return { tickers, loading, coinCcyList }
}
