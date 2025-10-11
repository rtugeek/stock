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
  ccy?: string
  basecy?: string
}

export const Coins: Coin[] = [
  {
    type: 'BTC-USD',
    name: 'Bitcoin',
    ccy: 'BTC',
    logo: 'https://www.okx.com/cdn/announce/20230419/168187541969745fb238e-d1b3-4ce6-962b-13437f92960d.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'TETHER-GOLD-XAUT',
    name: 'Tether Gold',
    ccy: 'XAUT',
    logo: 'https://www.okx.com/cdn/oksupport/asset/currency/icon/xaut20230815151810.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'ETH-USD',
    name: 'Ethereum',
    ccy: 'ETH',
    logo: 'https://www.okx.com/cdn/announce/20230419/1681875475851e1d1320b-a48f-4c1a-a6fd-3c4ec0a3cc7e.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'XRP-USD',
    name: 'XRP',
    ccy: 'XRP',
    logo: 'https://www.okx.com/cdn/announce/20230419/1681875637926ca623341-1b36-4572-b1f7-8132abf5aa38.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'BNB-USD',
    name: 'BNB',
    ccy: 'BNB',
    logo: 'https://www.okx.com/cdn/announce/20221218/16713389339243f7aae1a-9be4-4610-a777-f246175c1c28.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'SOL-USD',
    name: 'Solana',
    ccy: 'SOL',
    logo: 'https://www.okx.com/cdn/announce/20230419/1681875530349f92aa4a2-db30-4964-999c-ef7eb6f3914a.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'TRX-USD',
    name: 'TRON',
    ccy: 'TRX',
    logo: 'https://www.okx.com/cdn/announce/20230419/1681875547069b9cd58ac-5e59-4cc1-81f6-ebdddad9b840.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'DOGE-USD',
    name: 'Dogecoin',
    ccy: 'DOGE',
    logo: 'https://www.okx.com/cdn/announce/20230419/168187545703814a061ab-16b9-4cc6-9151-327296c29f36.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'SUI-USD',
    name: 'Sui',
    ccy: 'SUI',
    logo: 'https://www.okx.com/cdn/announce/20230503/1683110375934a70f7d31-4ec2-495f-8675-390441755a5c.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'OKB-USD',
    name: 'OKB',
    ccy: 'OKB',
    logo: 'https://www.okx.com/cdn/announce/20230419/16818755125565e5c0127-9cb7-4f32-864a-cdc63448a3b2.png?x-oss-process=image/format,webp/ignore-error,1',
  },
  {
    type: 'TRUMP-USD',
    name: 'TRUMP',
    ccy: 'TRUMP',
    logo: 'https://www.okx.com/cdn/announce/20250118/17371841165893038a940-cc19-48cf-922d-e0424015a7e1.png?x-oss-process=image/format,webp/ignore-error,1',
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
