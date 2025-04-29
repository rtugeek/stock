import type { RouteRecordRaw } from 'vue-router'

import GoldWidgetRoutes from './gold/GoldWidgetRoutes'
import StockWidgetRoutes from './stock/StockWidgetRoutes'
import StockMediumWidgetRoutes from './stock-medium/StockMediumWidgetRoutes'
import StockSmallWidgetRoutes from './stock-small/StockSmallWidgetRoutes'
// FBI WANING! IMPORT PLACE, DONT DELETE THIS LINE
const WidgetRouter: RouteRecordRaw[] = [
  ...StockWidgetRoutes,
  ...StockMediumWidgetRoutes,
  ...StockSmallWidgetRoutes,
  ...GoldWidgetRoutes,
  // FBI WANING! ROUTE PLACE, DONT DELETE THIS LINE
]
export default WidgetRouter
