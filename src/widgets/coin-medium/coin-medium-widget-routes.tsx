import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import CoinMediumWidget from './coin-medium.widget'

const CoinMediumWidgetView = lazy(() => import('./coin-medium-widget-view'))
const CoinMediumConfigView = lazy(() => import('./coin-medium-config-view'))

const path = CoinMediumWidget.path
const name = CoinMediumWidget.name
const configPagePath = CoinMediumWidget.configPagePath!.split('?')[0]

const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const CoinMediumWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <CoinMediumWidgetView />
      </Suspense>
    ),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <CoinMediumConfigView />
      </Suspense>
    ),
  },
]

export default CoinMediumWidgetRoutes
