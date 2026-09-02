import type { OpenDataResult } from '@/api/opendata'
import type { Stock } from '@/model/stock'
import { Quotation } from '@/model/quotation'
import axios from 'axios'

export class BaiDuStockApi {
  /**
   * 股票
   * @param code
   */
  static async getStock(code: string): Promise<Stock | undefined> {
    return this.getByType(code, 'stock')
  }

  static async getFund(code: string): Promise<Stock | undefined> {
    return this.getByType(code, 'fund')
  }

  /**
   * 股票
   * @param code
   * @param type
   */
  static async getByType<T>(code: string, type?: StockType): Promise<T | undefined> {
    const data = await this.selfSelect(code)
    if (data.ResultCode == '0' && data.Result.stock.length > 0) {
      if (type) {
        return data.Result.stock.find((it: Stock) => it.type == type)
      }
      else {
        if (data.Result.stock.length > 0) {
          return data.Result.stock[0]
        }
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
   * @param query
   * @param month 1,3,6,12,36,60
   */
  static async getOpenData(query: string, month: number): Promise<OpenDataResult | undefined> {
    const response = await axios.get(`https://gushitong.baidu.com/opendata?resource_id=5824&query=${query}&new_need_di=1&source=qieman&m=${month}&t=ai&finClientType=pc`)
    const data = response.data as BaiDuApiResponse<OpenDataResult[]>
    if (data.Result && data.Result.length > 0) {
      return data.Result[0]
    }
    return undefined
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
    const response = await axios.get(`https://finance.pae.baidu.com/selfselect/sug?wd=${code}&skip_login=1&finClientType=pc`)
    return response.data as BaiDuApiResponse<any>
  }

  /**
   * 指数
   * @param code
   */
  static async getIndex(code: string): Promise<Stock | undefined> {
    const data = await this.selfSelect(code)
    if (data.ResultCode == '0' && data.Result.stock.length > 0) {
      return data.Result.stock.find((s: Stock) => s.type == 'index')
    }
    return undefined
  }
}

export type QuotationGroup = 'quotation_minute_ab' | 'quotation_index_fiveday' | 'quotation_block_minute'
export type StockType = 'index' | 'fund' | 'stock' | 'block'

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
