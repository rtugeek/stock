import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import CoinSmallWidget from './coin-small.widget'

const CoinSmallWidgetView = lazy(() => import('./coin-small-widget-view'))
const CoinSmallConfigView = lazy(() => import('./coin-small-config-view'))

const path = CoinSmallWidget.path
const name = CoinSmallWidget.name
const configPagePath = CoinSmallWidget.configPagePath!.split('?')[0]

const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const CoinSmallWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <CoinSmallWidgetView />
      </Suspense>
    ),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <CoinSmallConfigView />
      </Suspense>
    ),
  },
]

export default CoinSmallWidgetRoutes
