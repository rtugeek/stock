import axios from 'axios'

const METAL_API_URL = 'https://biquote.io/api/latest'

const METALS = [
  { code: 'XAUUSD', name: 'Gold' },
  { code: 'XAGUSD', name: 'Silver' },
  { code: 'XCUUSD', name: 'Copper' },
  { code: 'XPTUSD', name: 'Platinum' },
] as const

interface BiQuoteTick {
  symbol: string
  mid: number
  dayDiffPercent: number
  timestamp: string
  stale: boolean
  marketState: string
}

type BiQuoteResponse = Record<string, BiQuoteTick>

export interface MetalPrice {
  code: string
  name: string
  price: number
  changePercent: number
  updatedAt: string
  stale: boolean
  marketState: string
}

export class MetalApi {
  static async getPrices(): Promise<MetalPrice[]> {
    const params = new URLSearchParams()
    METALS.forEach(({ code }) => params.append('symbols', code))

    const response = await axios.get<BiQuoteResponse>(METAL_API_URL, {
      params,
      timeout: 10000,
    })

    return METALS.map(({ code, name }) => {
      const tick = response.data[code]
      if (!tick || !Number.isFinite(tick.mid) || !Number.isFinite(tick.dayDiffPercent)) {
        throw new Error(`Invalid ${code} price`)
      }
      return {
        code,
        name,
        price: tick.mid,
        changePercent: tick.dayDiffPercent,
        updatedAt: tick.timestamp,
        stale: tick.stale,
        marketState: tick.marketState,
      }
    })
  }
}
