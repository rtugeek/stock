import { SignUtils } from '@/api/SignUtils'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://global.itime.fun/coin/api',
})

const API_SECRET = 'COIN-WIDGET'

api.interceptors.request.use(async (config) => {
  const timestamp = new Date().toISOString()
  const method = (config.method || 'get') as 'get' | 'post' | 'delete' | 'put'
  const requestPath = `/coin/api${config.url}`
  let body: Record<string, any> = {}
  if (config.data && typeof config.data === 'object') {
    body = config.data
  }
  const sign = await SignUtils.sign(method, requestPath, body, API_SECRET, timestamp)
  config.headers = {
    ...config.headers,
    'ok-access-secret': API_SECRET,
    'ok-access-sign': sign,
    'ok-access-timestamp': timestamp,
    'Content-Type': 'application/json',
  }
  return config
})

export class CoinApi {
  static async getCandlesHistory(icon: CoinType): Promise<CandleData[]> {
    const res = await api.get('/candles/history', {
      params: {
        instId: icon,
      },
    })
    return res.data
  }

  static async getIndexTickers(coin: Coin, quoteCcy: 'USD' | string = 'USD'): Promise<string[][]> {
    const res = await axios.get(`https://www.okx.com/priapi/v5/market/currency-trend?baseCcy=${coin.ccy}&limit=288&bar=5m&quoteCcy=${quoteCcy}&isPremium=false`)
    return res.data.data
  }
}
export type CoinType = 'BTC-USD' | 'ETH-USD' | 'DOGE-USD'
export interface CandleData {
  /**
   * 需要设置成索引，并且这个是id
   */
  ts: Date // 开始时间
  o: string // 开盘价格
  h: string // 最高价格
  l: string // 最低价格
  c: string // 收盘价格
  confirm: string // K线状态，0 代表未完结，1 代表已完结
  /**
   * 需要设置为索引
   */
  instId: string
}

export interface Coin {
  type: CoinType | string
  name: string
  logo: string
  ccy: string
}

export const Coins: Coin[] = [
  {
    type: 'BTC-USD',
    name: 'Bitcoin',
    ccy: 'BTC',
    logo: 'https://widgetjs.cn/stock/coin/bitcoin.png',
  },
  {
    type: 'ETH-USD',
    name: 'Ethereum',
    ccy: 'ETH',
    logo: 'https://widgetjs.cn/stock/coin/ethereum.png',
  },
  {
    type: 'USDT-USD',
    name: 'Tether',
    ccy: 'USDT',
    logo: 'https://widgetjs.cn/stock/coin/tether.png',
  },
  {
    type: 'XRP-USD',
    name: 'XRP',
    ccy: 'XRP',
    logo: 'https://widgetjs.cn/stock/coin/xrp.png',
  },
  {
    type: 'BNB-USD',
    name: 'BNB',
    ccy: 'BNB',
    logo: 'https://widgetjs.cn/stock/coin/bnb.png',
  },
  {
    type: 'SOL-USD',
    name: 'Solana',
    ccy: 'SOL',
    logo: 'https://widgetjs.cn/stock/coin/solana.png',
  },
  {
    type: 'USDC-USD',
    name: 'USD Coin',
    ccy: 'USDC',
    logo: 'https://widgetjs.cn/stock/coin/usd_coin.png',
  },
  {
    type: 'TRX-USD',
    name: 'TRON',
    ccy: 'TRX',
    logo: 'https://widgetjs.cn/stock/coin/tron.png',
  },
  {
    type: 'DOGE-USD',
    name: 'Dogecoin',
    ccy: 'DOGE',
    logo: 'https://widgetjs.cn/stock/coin/dogecoin.png',
  },
  {
    type: 'ADA-USD',
    name: 'Cardano',
    ccy: 'ADA',
    logo: 'https://widgetjs.cn/stock/coin/cardano.png',
  },
  {
    type: 'HYPE-USD',
    name: 'Hyperliquid',
    ccy: 'HYPE',
    logo: 'https://widgetjs.cn/stock/coin/hyperliquid.png',
  },
  {
    type: 'BCH-USD',
    name: 'Bitcoin Cash',
    ccy: 'BCH',
    logo: 'https://widgetjs.cn/stock/coin/bitcoin_cash.png',
  },
  {
    type: 'SUI-USD',
    name: 'Sui',
    ccy: 'SUI',
    logo: 'https://widgetjs.cn/stock/coin/sui.png',
  },
  {
    type: 'LINK-USD',
    name: 'Chainlink',
    ccy: 'LINK',
    logo: 'https://widgetjs.cn/stock/coin/chainlink.png',
  },
  {
    type: 'LEO-USD',
    name: 'UNUS SED LEO',
    ccy: 'LEO',
    logo: 'https://widgetjs.cn/stock/coin/unus_sed_leo.png',
  },
  {
    type: 'AVAX-USD',
    name: 'Avalanche',
    ccy: 'AVAX',
    logo: 'https://widgetjs.cn/stock/coin/avalanche.png',
  },
  {
    type: 'XLM-USD',
    name: 'Stellar',
    ccy: 'XLM',
    logo: 'https://widgetjs.cn/stock/coin/stellar.png',
  },
  {
    type: 'TON-USD',
    name: 'Toncoin',
    ccy: 'TON',
    logo: 'https://widgetjs.cn/stock/coin/toncoin.png',
  },
  {
    type: 'SHIB-USD',
    name: 'Shiba Inu',
    ccy: 'SHIB',
    logo: 'https://widgetjs.cn/stock/coin/shiba_inu.png',
  },
  {
    type: 'PI-USD',
    name: 'Pi',
    ccy: 'PI',
    logo: 'https://widgetjs.cn/stock/coin/pi.png',
  },
  {
    type: 'OKB-USD',
    name: 'OKB',
    ccy: 'OKB',
    logo: 'https://widgetjs.cn/stock/coin/okb.png',
  },
  {
    type: 'TRUMP-USD',
    name: 'TRUMP',
    ccy: 'TRUMP',
    logo: 'https://widgetjs.cn/stock/coin/trump.png',
  },
]

export interface IndexTicker {
  /** 指数 */
  instId: string
  /** 最新指数价格 */
  idxPx: string
  /** 24小时指数最高价格 */
  high24h: string
  /** UTC 0 时开盘价 */
  sodUtc0: string
  /** 24小时指数开盘价格 */
  open24h: string
  /** 24小时指数最低价格 */
  low24h: string
  /** UTC+8 时开盘价 */
  sodUtc8: string
  /** 指数价格更新时间，Unix时间戳的毫秒数格式，如1597026383085 */
  ts: string
}

export interface OkxWebSocketOpArg {
  channel: 'cup-tickers-3s'
  ccy: 'BTC' | string
}

export interface OkxWebSocketOp {
  op: 'subscribe' | 'unsubscribe'
  args: OkxWebSocketOpArg[]
}

export interface OkxWebSocketEventData {
  /** 币种，如 'BTC' */
  ccy: string
  /** 最新成交价 */
  last: string
  /** 24小时开盘价 */
  open24h: string
  /** 24小时最高价 */
  high24h: string
  /** 24小时最低价 */
  low24h: string
  /** UTC 0 时开盘价 */
  sodUtc0: string
  /** UTC+8 时开盘价 */
  sodUtc8: string
  /** 指数价格更新时间，Unix时间戳的毫秒数格式 */
  ts: string
}
export interface OkxWebSocketEvent {
  arg: OkxWebSocketOpArg
  data: OkxWebSocketEventData[]
}
