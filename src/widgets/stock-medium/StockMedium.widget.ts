import { Widget, WidgetKeyword } from '@widget-js/core'

const StockMediumWidget = new Widget({
  name: 'cn.stocks.widget.stock_medium',
  title: { 'zh-CN': '大A指数' },
  description: { 'zh-CN': '珍爱生命，远离股市' },
  keywords: [WidgetKeyword.RECOMMEND],
  categories: ['utilities'],
  lang: 'zh-CN',
  width: 4,
  height: 2,
  minWidth: 4,
  maxWidth: 4,
  minHeight: 2,
  maxHeight: 2,
  previewImage: '/preview_stock_medium.png',
  path: '/widget/stock_medium',
  socialLinks: [
    { name: 'github', link: 'https://github.com/rtugeek/stocks-desktop' },
  ],
})

export default StockMediumWidget
