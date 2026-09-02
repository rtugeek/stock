import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import StockSmallWidget from './stock-small.widget'

const StockSmallWidgetView = lazy(() => import('./stock-small-widget-view'))
const StockSmallConfigView = lazy(() => import('./stock-small-config-view'))

const path = StockSmallWidget.path
const name = StockSmallWidget.name
const configPagePath = StockSmallWidget.configPagePath!.split('?')[0]

const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const StockSmallWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <StockSmallWidgetView />
      </Suspense>
    ),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <StockSmallConfigView />
      </Suspense>
    ),
  },
]

export default StockSmallWidgetRoutes
