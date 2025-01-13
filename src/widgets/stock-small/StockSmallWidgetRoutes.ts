import type { RouteRecordRaw } from 'vue-router'
import StockSmallWidget from './StockSmall.widget'

const path = StockSmallWidget.path
const name = StockSmallWidget.name

const configPagePath = StockSmallWidget.configPagePath!.split('?')[0]

const StockSmallWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "cn.stocks.widget.stock_small" */ './StockSmallWidgetView.vue'
      ),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () =>
      import(
        /* webpackChunkName: "cn.stocks.widget.stock_small.config" */ './StockSmallConfigView.vue'
      ),
  },
]

export default StockSmallWidgetRoutes
