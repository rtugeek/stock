import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import GoldWidget from './gold.widget'

const GoldWidgetView = lazy(() => import('./gold-widget-view'))
const GoldConfigView = lazy(() => import('./gold-config-view'))

const path = GoldWidget.path
const name = GoldWidget.name
const configPagePath = GoldWidget.configPagePath!.split('?')[0]

const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const GoldWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <GoldWidgetView />
      </Suspense>
    ),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <GoldConfigView />
      </Suspense>
    ),
  },
]

export default GoldWidgetRoutes
