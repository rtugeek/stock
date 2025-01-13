import { Widget, WidgetKeyword } from '@widget-js/core'

const StockSmallWidget = new Widget({
  name: 'cn.stocks.widget.stock_small',
  title: { 'zh-CN': '股票', 'en-US': 'Stock' },
  description: { 'zh-CN': '跟踪股票价格，每分钟刷新一次', 'en-US': 'Track stock prices, refresh every minute' },
  keywords: [WidgetKeyword.RECOMMEND],
  categories: [],
  lang: 'zh-CN',
  width: 2,
  height: 2,
  minWidth: 2,
  maxWidth: 2,
  minHeight: 2,
  maxHeight: 2,
  previewImage: '/preview_stock_small.png',
  path: '/widget/stock_small',
  socialLinks: [
    { name: 'github', link: 'https://github.com/rtugeek/stocks-desktop' },
  ],
  configPagePath:
    '/widget/config/stock_small?width=600&height=500&frame=true&transparent=false',
})

export default StockSmallWidget
