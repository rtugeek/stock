import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import StockMediumWidget from './stock-medium.widget'

const StockMediumWidgetView = lazy(() => import('./stock-medium-widget-view'))
const StockMediumConfigView = lazy(() => import('./stock-medium-config-view'))

const path = StockMediumWidget.path
const name = StockMediumWidget.name
const configPagePath = StockMediumWidget.configPagePath
  ? StockMediumWidget.configPagePath.split('?')[0]
  : '/widget/config/stock_medium'

const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const StockMediumWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <StockMediumWidgetView />
      </Suspense>
    ),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <StockMediumConfigView />
      </Suspense>
    ),
  },
]

export default StockMediumWidgetRoutes
