import type { RouteRecordRaw } from 'vue-router'
import StockMediumWidget from './StockMedium.widget'

const path = StockMediumWidget.path
const name = StockMediumWidget.name
// const configPagePath = StockMediumWidget.configPagePath!.split('?')[0]

const StockMediumWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () =>
      import(
        /* webpackChunkName: "cn.stocks.widget.stock_medium" */ './StockMediumWidgetView.vue'
      ),
  },
  // {
  //   path: configPagePath,
  //   name: `${name}.config`,
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "cn.stocks.widget.stock_medium.config" */ './StockMediumConfigView.vue'
  //     ),
  // },
]

export default StockMediumWidgetRoutes
