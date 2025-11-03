import type { RouteRecordRaw } from 'vue-router'
import CoinMediumWidget from './CoinMedium.widget'

const path = CoinMediumWidget.path
const name = CoinMediumWidget.name

const configPagePath = CoinMediumWidget.configPagePath!.split('?')[0]

const CoinMediumWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () => import('./CoinMediumWidgetView.vue'),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () => import('./CoinMediumConfigView.vue'),
  },
]

export default CoinMediumWidgetRoutes
