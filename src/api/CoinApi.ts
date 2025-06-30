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

  static async getIndexTickers(code: CoinType): Promise<IndexTicker[]> {
    const res = await api.get('/index-tickers', {
      params: {
        instId: code,
      },
    })
    return res.data
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
}

export const Coins: Coin[] = [
  {
    type: 'BTC-USD',
    name: 'Bitcoin',
    logo: 'https://widgetjs.cn/stock/coin/bitcoin.png',
  },
  {
    type: 'ETH-USD',
    name: 'Ethereum',
    logo: 'https://widgetjs.cn/stock/coin/ethereum.png',
  },
  {
    type: 'USDT-USD',
    name: 'Tether',
    logo: 'https://widgetjs.cn/stock/coin/tether.png',
  },
  {
    type: 'XRP-USD',
    name: 'XRP',
    logo: 'https://widgetjs.cn/stock/coin/xrp.png',
  },
  {
    type: 'BNB-USD',
    name: 'BNB',
    logo: 'https://widgetjs.cn/stock/coin/bnb.png',
  },
  {
    type: 'SOL-USD',
    name: 'Solana',
    logo: 'https://widgetjs.cn/stock/coin/solana.png',
  },
  {
    type: 'USDC-USD',
    name: 'USD Coin',
    logo: 'https://widgetjs.cn/stock/coin/usd_coin.png',
  },
  {
    type: 'TRX-USD',
    name: 'TRON',
    logo: 'https://widgetjs.cn/stock/coin/tron.png',
  },
  {
    type: 'DOGE-USD',
    name: 'Dogecoin',
    logo: 'https://widgetjs.cn/stock/coin/dogecoin.png',
  },
  {
    type: 'ADA-USD',
    name: 'Cardano',
    logo: 'https://widgetjs.cn/stock/coin/cardano.png',
  },
  {
    type: 'HYPE-USD',
    name: 'Hyperliquid',
    logo: 'https://widgetjs.cn/stock/coin/hyperliquid.png',
  },
  {
    type: 'BCH-USD',
    name: 'Bitcoin Cash',
    logo: 'https://widgetjs.cn/stock/coin/bitcoin_cash.png',
  },
  {
    type: 'SUI-USD',
    name: 'Sui',
    logo: 'https://widgetjs.cn/stock/coin/sui.png',
  },
  {
    type: 'LINK-USD',
    name: 'Chainlink',
    logo: 'https://widgetjs.cn/stock/coin/chainlink.png',
  },
  {
    type: 'LEO-USD',
    name: 'UNUS SED LEO',
    logo: 'https://widgetjs.cn/stock/coin/unus_sed_leo.png',
  },
  {
    type: 'AVAX-USD',
    name: 'Avalanche',
    logo: 'https://widgetjs.cn/stock/coin/avalanche.png',
  },
  {
    type: 'XLM-USD',
    name: 'Stellar',
    logo: 'https://widgetjs.cn/stock/coin/stellar.png',
  },
  {
    type: 'TON-USD',
    name: 'Toncoin',
    logo: 'https://widgetjs.cn/stock/coin/toncoin.png',
  },
  {
    type: 'SHIB-USD',
    name: 'Shiba Inu',
    logo: 'https://widgetjs.cn/stock/coin/shiba_inu.png',
  },
  {
    type: 'PI-USD',
    name: 'Pi',
    logo: 'https://widgetjs.cn/stock/coin/pi.png',
  },
  {
    type: 'OKB-USD',
    name: 'OKB',
    logo: 'https://widgetjs.cn/stock/coin/okb.png',
  },
  {
    type: 'TRUMP-USD',
    name: 'TRUMP',
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
