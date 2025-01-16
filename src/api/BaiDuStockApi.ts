import type { Stock } from '@/model/Stock'
import { Quotation } from '@/model/Qutation'
import axios from 'axios'

export class BaiDuStockApi {
  /**
   * 股票
   * @param code
   */
  static async getStock(code: string): Promise<Stock | undefined> {
    const data = await this.selfSelect(code)
    if (data.ResultCode == '0' && data.Result.stock.length > 0) {
      const stock = data.Result.stock.find(it => it.type == 'stock')
      if (stock) {
        return stock
      }
    }
    return undefined
  }

  static async getQuotation(code: string): Promise<BaiDuApiResponse<QuotationResult>> {
    const response = await axios.get(`https://finance.pae.baidu.com/vapi/v1/getquotation?all=1&srcid=5353&pointType=string&group=quotation_fiveday_ab&market_type=ab&new_Format=1&finClientType=pc&code=${code}`)
    return response.data as BaiDuApiResponse<QuotationResult>
  }

  /**
   *
   * @param code
   * @param group quotation_minute_ab  quotation_index_fiveday
   */
  static async getQuotationMinute(code: string, group: QuotationGroup = 'quotation_minute_ab'): Promise<Quotation> {
    const response = await axios.get(`https://finance.pae.baidu.com/vapi/v1/getquotation`, {
      params: {
        all: 1,
        srcid: 5353,
        group,
        market_type: 'ab',
        code,
        finClientType: 'pc',
        eprop: 'min',
        chartType: 'minute',
        stock_type: 'ab',
      },
    })
    const data = response.data as BaiDuApiResponse<Quotation>
    return new Quotation(data.Result)
  }

  static async selfSelect(code: string) {
    const response = await axios.get(`https://finance.pae.baidu.com/selfselect/sug?wd=${code}&skip_login=1&finClientType=pc}`)
    return response.data as BaiDuApiResponse<any>
  }

  /**
   * 指数
   * @param code
   */
  static async getIndex(code: string): Promise<Stock | undefined> {
    const data = await this.selfSelect(code)
    if (data.ResultCode == '0' && data.Result.stock.length > 0) {
      return data.Result.stock.find(s => s.type == 'index')
    }
    return undefined
  }
}

export type QuotationGroup = 'quotation_minute_ab' | 'quotation_index_fiveday'
export type StockType = 'index' | 'fund' | 'stock'

export interface LabelMap {
  text: string
  ename: string
}

export interface StockStatus {
  is_trend: string
  time_sort: string
}

export interface Result {
  stock: Stock[]
  index: any[]
  deal_status: string
  stock_status: StockStatus
  refresh_time: string
  labelMap: LabelMap[]
  isNew: string
  follow_num: string
}

export interface BaiDuApiResponse<T> {
  QueryID: string
  /**
   * 非0代表成功
   */
  ResultCode: string | number
  Result: T
}

interface MarketData {
  date: string
  p: string // Contains the actual trading data in CSV format
}

export interface QuotationResult {
  StdStg: string
  StdStl: string
  _update_time: string
  code: string
  url: string
  wiseUrl: string
  encode: string
  key: string
  provider: string
  update: {
    timezone: string
    text: string
    time: number
    time_diff: string
  }
  newMarketData: NewMarketData
}

export interface NewMarketData {
  headers: string[]
  keys: string[]
  marketData: MarketData[]
}
