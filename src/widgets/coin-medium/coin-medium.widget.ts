import { DeployMode, Widget, WidgetKeyword } from '@widget-js/core'

const CoinMediumWidget = new Widget({
  name: 'cn.stocks.widget.coin_medium',
  title: { 'zh-CN': '主流虚拟币' },
  description: { 'zh-CN': '实时查看主流虚拟币行情' },
  keywords: [WidgetKeyword.RECOMMEND],
  categories: [],
  lang: 'zh-CN',
  width: 4,
  height: 4,
  minWidth: 4,
  maxWidth: 6,
  minHeight: 2,
  maxHeight: 6,
  previewImage: '/preview_coin_medium.png',
  path: '/widget/coin_medium',
  icon: 'https://widgetjs.cn/stock/btc.ico',
  supportDeployMode: DeployMode.TRAY | DeployMode.OVERLAP | DeployMode.NORMAL,
  configPagePath:
    '/widget/config/coin_medium?width=600&height=500&frame=true&transparent=false',
  socialLinks: [
    { name: 'github', link: 'https://github.com/rtugeek/stock' },
  ],
})

export default CoinMediumWidget
