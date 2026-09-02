import type { GoldApiResponse } from '@/api/gold-api'

export interface GoldStatus {
  yesterdayClosePrice: number
  todayClosePrice: number
  data: GoldApiResponse
}
