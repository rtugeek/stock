import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import StockWidget from './stock-widget.widget'

const StockWidgetView = lazy(() => import('./stock-widget-view'))
const StockConfigView = lazy(() => import('./stock-config-view'))

const path = StockWidget.path
const name = StockWidget.name
const configPagePath = StockWidget.configPagePath!.split('?')[0]

const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const StockWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <StockWidgetView />
      </Suspense>
    ),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <StockConfigView />
      </Suspense>
    ),
  },
]

export default StockWidgetRoutes
