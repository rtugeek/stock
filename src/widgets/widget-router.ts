import type { RouteRecordRaw } from 'vue-router'

import CoinMediumWidgetRoutes from './coin-medium/CoinMediumWidgetRoutes'
import CoinSmallWidgetRoutes from './coin-small/CoinSmallWidgetRoutes'
import GoldWidgetRoutes from './gold/GoldWidgetRoutes'
import MetalWidgetRoutes from './metal/MetalWidgetRoutes'
import StockMediumWidgetRoutes from './stock-medium/StockMediumWidgetRoutes'
import StockSmallWidgetRoutes from './stock-small/StockSmallWidgetRoutes'
import StockWidgetRoutes from './stock/StockWidgetRoutes'
// FBI WANING! IMPORT PLACE, DONT DELETE THIS LINE
const WidgetRouter: RouteRecordRaw[] = [
  ...StockWidgetRoutes,
  ...StockMediumWidgetRoutes,
  ...StockSmallWidgetRoutes,
  ...GoldWidgetRoutes,
  ...CoinSmallWidgetRoutes,
  ...CoinMediumWidgetRoutes,
  ...MetalWidgetRoutes,
  // FBI WANING! ROUTE PLACE, DONT DELETE THIS LINE
]
export default WidgetRouter
