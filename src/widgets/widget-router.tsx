import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'

import CoinMediumWidgetRoutes from './coin-medium/coin-medium-widget-routes'
import CoinSmallWidgetRoutes from './coin-small/coin-small-widget-routes'
import GoldWidgetRoutes from './gold/gold-widget-routes'
import MetalWidgetRoutes from './metal/metal-widget-routes'
import StockMediumWidgetRoutes from './stock-medium/stock-medium-widget-routes'
import StockSmallWidgetRoutes from './stock-small/stock-small-widget-routes'
import StockWidgetRoutes from './stock/stock-widget-routes'

const LandingPage = lazy(() => import('./landing-page'))

const SuspenseFallback = () => (
  <div className="w-full h-full min-h-screen flex items-center justify-center">
    <div className="animate-pulse opacity-50 text-sm">加载中...</div>
  </div>
)

const LandingRoute: RouteObject[] = [
  {
    path: '/',
    id: 'landing-page',
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
]

const WidgetRoutes: RouteObject[] = [
  ...LandingRoute,
  ...StockWidgetRoutes,
  ...StockMediumWidgetRoutes,
  ...StockSmallWidgetRoutes,
  ...GoldWidgetRoutes,
  ...CoinSmallWidgetRoutes,
  ...CoinMediumWidgetRoutes,
  ...MetalWidgetRoutes,
]

export default WidgetRoutes
export { WidgetRoutes }
