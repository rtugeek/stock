import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import MetalWidget from './metal.widget'

const MetalWidgetView = lazy(() => import('./metal-widget-view'))
const MetalConfigView = lazy(() => import('./metal-config-view'))

const path = MetalWidget.path
const name = MetalWidget.name
const configPagePath = MetalWidget.configPagePath!.split('?')[0]

const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const MetalWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <MetalWidgetView />
      </Suspense>
    ),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <MetalConfigView />
      </Suspense>
    ),
  },
]

export default MetalWidgetRoutes
