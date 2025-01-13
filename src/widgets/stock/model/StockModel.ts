// import { WidgetData } from "@widget-js/core";

export class StockModel {
  code: string = ''
  price: string = ''
  change: string = ''
  changeArrow: string = 'up'
  name: string = ''
}

export const DEFAULT_STOCK_CODE = 'AAPL,GOOGL,MSFT,AMZN,TSLA'
