import axios from 'axios'

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export class GoldApi {
  static async quotations(instid: string = 'Au99.99'): Promise<GoldApiResponse> {
    const form = new FormData()
    form.set('instid', instid)
    const res = await axios.post('https://www.sge.com.cn/graph/quotations', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  }

  static async hqsj(): Promise<{ close: number, open: number } > {
    const res = await axios.get('https://www.sge.com.cn/hqsj')
    const dom = new DOMParser()
    const document = dom.parseFromString(res.data as string, 'text/html')
    const openPrice = document.querySelector('.ininfo td:nth-child(2)')?.textContent
    const closePrice = document.querySelector('.ininfo td:nth-child(3)')?.textContent
    const result = {
      close: 0,
      open: 0,
    }
    if (openPrice) {
      result.open = Number.parseFloat(openPrice)
    }
    if (closePrice) {
      result.close = Number.parseFloat(closePrice)
    }
    return result
  }

  /**
   * https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2025-04-28&end_date=2025-04-28&inst_ids=Au99.99
   */
  static async getYesterdayClosePrice(): Promise<number> {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDate(yesterday)
    const res = await axios.get(`https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=${yesterdayStr}&end_date=${yesterdayStr}&inst_ids=Au99.99`)
    const dom = new DOMParser()
    const document = dom.parseFromString(res.data as string, 'text/html')
    const price = document.querySelector('.daily_new_table tbody td:nth-child(6)')?.textContent
    if (price) {
      return Number.parseFloat(price)
    }
    else {
      return 0
    }
  }
}

export interface GoldApiResponse {
  times: string[] // 时间数组
  data: string[] // 数据数组
  min: number // 最小值
  max: number // 最大值
  heyue: string // 合约名称
  delaystr: string // 延迟时间字符串
}
