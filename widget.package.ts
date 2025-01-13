import { WidgetPackage } from '@widget-js/core'

export default new WidgetPackage({
  author: 'Neo Fu',
  description: {
    'zh-CN': '每分钟更新一次股票数据',
  },
  entry: '/',
  hash: true,
  homepage: '',
  name: 'cn.stocks.widget',
  socialLinks: [
    { name: 'github', link: 'https://github.com/rtugeek/stocks-desktop' },
  ],
  title: {
    'zh-CN': '股票组件',
  },
  remote: {
    entry: 'https://widgetjs.cn/stock',
    base: '/stock',
    hostname: 'widgetjs.cn',
  },
  devOptions: {
    folder: './src/widgets/',
  },
})
