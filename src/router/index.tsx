import { createHashRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { RouteErrorElement } from '@/components/error-boundary'

const LandingPage = lazy(() => import('@/widgets/landing-page'))

const StockWidgetView = lazy(() => import('@/widgets/stock/stock-widget-view'))
const StockConfigView = lazy(() => import('@/widgets/stock/stock-config-view'))

const StockSmallWidgetView = lazy(() => import('@/widgets/stock-small/stock-small-widget-view'))
const StockSmallConfigView = lazy(() => import('@/widgets/stock-small/stock-small-config-view'))

const StockMediumWidgetView = lazy(() => import('@/widgets/stock-medium/stock-medium-widget-view'))

const GoldWidgetView = lazy(() => import('@/widgets/gold/gold-widget-view'))
const GoldConfigView = lazy(() => import('@/widgets/gold/gold-config-view'))

const CoinSmallWidgetView = lazy(() => import('@/widgets/coin-small/coin-small-widget-view'))
const CoinSmallConfigView = lazy(() => import('@/widgets/coin-small/coin-small-config-view'))

const CoinMediumWidgetView = lazy(() => import('@/widgets/coin-medium/coin-medium-widget-view'))
const CoinMediumConfigView = lazy(() => import('@/widgets/coin-medium/coin-medium-config-view'))

const MetalWidgetView = lazy(() => import('@/widgets/metal/metal-widget-view'))
const MetalConfigView = lazy(() => import('@/widgets/metal/metal-config-view'))

function LazyWrapper() {
  const location = useLocation()

  useEffect(() => {
    const isConfigOrLanding =
      location.pathname === '/' || location.pathname.includes('/config/')
    if (isConfigOrLanding) {
      document.body.classList.add('app-shell')
    } else {
      document.body.classList.remove('app-shell')
    }
  }, [location.pathname])

  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  )
}

export const router = createHashRouter([
  {
    element: <LazyWrapper />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/widget/stock',
        element: <StockWidgetView />,
      },
      {
        path: '/widget/config/stock',
        element: <StockConfigView />,
      },
      {
        path: '/widget/stock_small',
        element: <StockSmallWidgetView />,
      },
      {
        path: '/widget/config/stock_small',
        element: <StockSmallConfigView />,
      },
      {
        path: '/widget/stock_medium',
        element: <StockMediumWidgetView />,
      },
      {
        path: '/widget/gold',
        element: <GoldWidgetView />,
      },
      {
        path: '/widget/config/gold',
        element: <GoldConfigView />,
      },
      {
        path: '/widget/coin_small',
        element: <CoinSmallWidgetView />,
      },
      {
        path: '/widget/config/coin_small',
        element: <CoinSmallConfigView />,
      },
      {
        path: '/widget/coin_medium',
        element: <CoinMediumWidgetView />,
      },
      {
        path: '/widget/config/coin_medium',
        element: <CoinMediumConfigView />,
      },
      {
        path: '/widget/metal',
        element: <MetalWidgetView />,
      },
      {
        path: '/widget/config/metal',
        element: <MetalConfigView />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
