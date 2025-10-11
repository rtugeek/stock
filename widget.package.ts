import { WidgetPackage } from '@widget-js/core'

export default new WidgetPackage({
  author: 'Neo Fu',
  description: {
    'zh-CN': '便捷获取股票、基金和虚拟币行情',
  },
  entry: '/',
  hash: true,
  homepage: '',
  name: 'cn.stocks.widget',
  socialLinks: [
    { name: 'github', link: 'https://github.com/rtugeek/stocks-desktop' },
  ],
  title: {
    'zh-CN': '韭菜组件',
  },
  zipUrl: 'https://widgetjs.cn/stock/widget.zip',
  remote: {
    entry: 'https://widgetjs.cn/stock',
    base: '/stock',
    hostname: 'widgetjs.cn',
  },
  devOptions: {
    folder: './src/widgets/',
  },
})
