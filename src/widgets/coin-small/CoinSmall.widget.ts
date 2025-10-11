import { DeployMode, Widget, WidgetKeyword } from '@widget-js/core'

const CoinSmallWidget = new Widget({
  name: 'cn.stocks.widget.coin_small',
  title: { 'zh-CN': '虚拟币' },
  description: { 'zh-CN': '查看虚拟货币行情，每分钟刷新一次' },
  keywords: [WidgetKeyword.RECOMMEND],
  categories: ['finance'],
  lang: 'zh-CN',
  width: 2,
  height: 2,
  minWidth: 2,
  maxWidth: 2,
  minHeight: 2,
  maxHeight: 2,
  icon: 'https://widgetjs.cn/stock/btc.ico',
  previewImage: '/preview_coin_small.png',
  path: '/widget/coin_small',
  supportDeployMode: DeployMode.TRAY | DeployMode.OVERLAP | DeployMode.NORMAL,
  configPagePath:
    '/widget/config/coin_small?width=600&height=500&frame=true&transparent=false',
})

export default CoinSmallWidget
