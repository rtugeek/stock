import type { RouteRecordRaw } from 'vue-router'
import GoldWidget from './Gold.widget'

const path = GoldWidget.path
const name = GoldWidget.name

const configPagePath = GoldWidget.configPagePath!.split('?')[0]

const GoldWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () => import('./GoldWidgetView.vue'),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () => import('./GoldConfigView.vue'),
  },
]

export default GoldWidgetRoutes
