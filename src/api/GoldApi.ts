import axios from 'axios'
import { dayjs } from 'element-plus'

export class GoldApi {
  static async quotations(instid: string = 'Au99.99'): Promise<GoldApiResponse> {
    const form = new FormData()
    form.set('instid', instid)
    // 用axios post发送请求到 https://www.sge.com.cn/graph/quotations
    const res = await axios.post('https://www.sge.com.cn/graph/quotations', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  }

  static async hqsj(): Promise<number> {
    const res = await axios.get('https://www.sge.com.cn/hqsj')
    const dom = new DOMParser()
    const document = dom.parseFromString(res.data as string, 'text/html')
    const price = document.querySelector('.ininfo td:nth-child(2)')?.textContent
    if (price) {
      return Number.parseFloat(price)
    }
    else {
      return 0
    }
  }

  /**
   * https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2025-04-28&end_date=2025-04-28&inst_ids=Au99.99
   * @param date
   */
  static async getYesterdayClosePrice(): Promise<number> {
    const now = dayjs()
    const yesterday = now.subtract(1, 'days').format('YYYY-MM-DD')
    const res = await axios.get(`https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=${yesterday}&end_date=${yesterday}&inst_ids=Au99.99`)
    const dom = new DOMParser()
    const document = dom.parseFromString(res.data as string, 'text/html')
    const price = document.querySelector('.daily_new_table td:nth-child(6)')?.textContent
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
