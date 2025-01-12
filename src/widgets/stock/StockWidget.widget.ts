import { Widget, WidgetKeyword } from '@widget-js/core'

const StockWidget = new Widget({
  name: '.stock',
  title: { 'zh-CN': '股票', 'en-US': 'Stock' },
  description: { 'zh-CN': '跟踪股票价格，每分钟刷新一次', 'en-US': 'Track stock prices, refresh every minute' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 3,
  categories: ['utilities'],
  height: 2,
  minWidth: 3,
  maxWidth: 3,
  minHeight: 2,
  maxHeight: 5,
  previewImage: '/preview_stock.png',
  path: '/widget/stock',
  configPagePath: '/widget/config/stock?transparent=false&frame=true&height=400&width=600',
  socialLinks: [
    { name: 'github', link: 'https://github.com/rtugeek/stocks-desktop' },
  ],
})

export default StockWidget
