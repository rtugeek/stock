import type { RouteRecordRaw } from 'vue-router'
import CoinSmallWidget from './CoinSmall.widget'

const path = CoinSmallWidget.path
const name = CoinSmallWidget.name

const configPagePath = CoinSmallWidget.configPagePath!.split('?')[0]

const CoinSmallWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () => import('./CoinSmallWidgetView.vue'),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () => import('./CoinSmallConfigView.vue'),
  },
]

export default CoinSmallWidgetRoutes
