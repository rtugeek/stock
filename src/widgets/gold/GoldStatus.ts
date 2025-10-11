import type { GoldApiResponse } from '@/api/GoldApi'

export interface GoldStatus {
  yesterdayClosePrice: number
  todayClosePrice: number
  data: GoldApiResponse
}
