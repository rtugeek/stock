import type { RouteRecordRaw } from 'vue-router'
import MetalWidget from './Metal.widget'

const path = MetalWidget.path
const name = MetalWidget.name

const configPagePath = MetalWidget.configPagePath!.split('?')[0]

const MetalWidgetRoutes: RouteRecordRaw[] = [
  {
    path,
    name: `${name}`,
    component: () => import('./MetalWidgetView.vue'),
  },
  {
    path: configPagePath,
    name: `${name}.config`,
    component: () => import('./MetalConfigView.vue'),
  },
]

export default MetalWidgetRoutes
