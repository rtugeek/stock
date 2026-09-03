import { useEffect } from 'react'
import { WidgetWrapper, useWidgetStorage, useWidgetProxyConfig, useWidget } from '@widget-js/react'
import { createGlobalStyle } from 'styled-components'
import { Coins } from '@/api/coin-api'
import { formatNumber } from '@/lib/utils'
import { useCoinTickers } from '@/hooks/use-coin-tickers'

const PROXY_APPLIED_KEY = 'coin-medium-proxy-applied'

function hashProxy(config: { protocol?: string; host?: string; port?: string }): string {
  return `${config.protocol ?? ''}::${config.host ?? ''}::${config.port ?? ''}`
}

const CoinMediumGlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }

  * {
    user-select: none;
  }
`

export default function CoinMediumWidgetView() {
  useWidget()
  const [refreshInterval] = useWidgetStorage<string>('coin-medium-refresh', '3000')
  const { config: proxyConfig, updateProxy } = useWidgetProxyConfig({ storageKey: 'coin-proxy' })
  const [appliedHash, setAppliedHash] = useWidgetStorage<string>(PROXY_APPLIED_KEY, '')
  void refreshInterval

  useEffect(() => {
    const expected = hashProxy(proxyConfig)
    if (appliedHash === expected) return
    let cancelled = false
    const timer = setTimeout(() => {
      ;(async () => {
        await updateProxy()
        if (!cancelled) {
          setAppliedHash(expected)
          window.location.reload()
        }
      })()
    }, 3000)
    return () => {
      clearTimeout(timer)
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyConfig.protocol, proxyConfig.host, proxyConfig.port])

  const { tickers } = useCoinTickers(Coins)

  return (
    <WidgetWrapper>
      <CoinMediumGlobalStyle />
      <div
        className="w-full h-full overflow-y-auto"
        style={{ color: 'var(--widget-color, #ffffff)' }}
      >
      <div className="flex flex-col gap-4 p-4">
        {Coins.map((coin) => {
          const ccy = coin.ccy || 'BTC'
          const data = tickers[ccy]
          return (
            <div key={coin.type} className="flex items-center w-full">
              <img
                src={coin.logo}
                alt={coin.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: '#ffffff',
                }}
                onError={(e) => {
                  const base = (import.meta as any).env?.BASE_URL || '/'
                  const fallback = coin.ccy ? `${base}coin/${coin.ccy.toLowerCase()}.png` : `${base}coin/bitcoin.png`
                  ;(e.target as HTMLImageElement).src = fallback
                }}
              />
              <div className="flex flex-col min-w-0 ml-4" style={{ flex: '0 0 auto', minWidth: 0 }}>
                <span className="text-md font-bold leading-tight truncate text-white">{ccy}</span>
                <span className="text-sm opacity-75 truncate text-white">{coin.name}</span>
              </div>
              <span className="ml-auto font-semibold tabular-nums whitespace-nowrap text-white" style={{ marginRight: 16 }}>
                ${data ? formatNumber(data.last) : '--'}
              </span>
              {data && (
                <span
                  className=" text-sm p-1 min-w-16 max-w-16 flex items-center justify-center rounded-sm tabular-nums flex-shrink-0 text-white"
                  style={{
                    backgroundColor: data.color,
                    color: '#ffffff',
                  }}
                >
                  {data.rateText}
                </span>
              )}
              {!data && (
                <span
                  className="text-lg font-bold h-10 min-w-28 max-w-28 flex items-center justify-center rounded-lg tabular-nums flex-shrink-0 text-white bg-white/10"
                >
                  --
                </span>
              )}
            </div>
          )
        })}
      </div>
      </div>
    </WidgetWrapper>
  )
}
