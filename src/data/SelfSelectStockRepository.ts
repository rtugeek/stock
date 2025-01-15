import type { Stock } from '@/api/BaiDuStockApi'
import localforage from 'localforage'

const selfSelectStock = localforage.createInstance({
  name: 'selfSelectStock',
})

class SelfSelectStockRepository {
  private static readonly STOCK_KEY = 'stocks'

  /**
   * 更新或者添加自选股
   * @param stock 股票信息
   */
  async save(stock: Stock): Promise<void> {
    try {
      const stocks = await this.getStocks()
      const index = stocks.findIndex(s => s.code === stock.code)

      if (index !== -1) {
        // 更新现有股票
        stocks[index] = stock
      }
      else {
        // 添加新股票
        stocks.push(stock)
      }

      await selfSelectStock.setItem(SelfSelectStockRepository.STOCK_KEY, stocks)
    }
    catch (error) {
      console.error('Failed to save stock:', error)
      throw new Error('保存自选股失败')
    }
  }

  async saveAll(stocks: Stock[]): Promise<void> {
    try {
      await selfSelectStock.setItem(SelfSelectStockRepository.STOCK_KEY, stocks)
    }
    catch (error) {
      console.error('Failed to save stocks:', error)
      throw new Error('保存自选股失败')
    }
  }

  /**
   * 列出所有自选股票
   * @returns 自选股票列表
   */
  async all(): Promise<Stock[]> {
    try {
      return await this.getStocks()
    }
    catch (error) {
      console.error('Failed to get stocks:', error)
      return []
    }
  }

  /**
   * 删除指定自选股
   * @param code 股票代码
   */
  async remove(code: string): Promise<void> {
    try {
      const stocks = await this.getStocks()
      const filteredStocks = stocks.filter(stock => stock.code !== code)
      await selfSelectStock.setItem(SelfSelectStockRepository.STOCK_KEY, filteredStocks)
    }
    catch (error) {
      console.error('Failed to remove stock:', error)
      throw new Error('删除自选股失败')
    }
  }

  /**
   * 获取存储的股票列表
   * @private
   */
  private async getStocks(): Promise<Stock[]> {
    const stocks = await selfSelectStock.getItem<Stock[]>(SelfSelectStockRepository.STOCK_KEY)
    return stocks || []
  }

  /**
   * 检查股票是否已在自选列表中
   * @param code 股票代码
   */
  async exists(code: string): Promise<boolean> {
    const stocks = await this.getStocks()
    return stocks.some(stock => stock.code === code)
  }

  /**
   * 清空所有自选股
   */
  async clear(): Promise<void> {
    try {
      await selfSelectStock.removeItem(SelfSelectStockRepository.STOCK_KEY)
    }
    catch (error) {
      console.error('Failed to clear stocks:', error)
      throw new Error('清空自选股失败')
    }
  }
}

export const selfSelectStockRepository = new SelfSelectStockRepository()
