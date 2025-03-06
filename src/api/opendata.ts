interface DispDataUrlEx {
  aesplitid: string
}

interface Series {
  label: string[]
  name: string
  special?: string
  value: string
}

interface TplData {
  ResultURL: string
  card_order: string
  data_source: string
  digits: string
  disp_data_url_ex: DispDataUrlEx
  lyAxis: any[]
  maxPoints: string
  sec: number
  series: Series[]
  showDate: string
  showTag: string
  text: string
  xAxis: string[]
}

interface ExtData {
  OriginQuery: string
  resourceid: string
  tplt: string
}

interface ResultData {
  extData: ExtData
  tplData: TplData
}

interface DisplayData {
  StdStg: string
  StdStl: string
  resultData: ResultData
  strategy: {
    ctplOrPhp: string
    hilightWord: string
    precharge: string
    tempName: string
  }
}

export interface OpenDataResult {
  ClickNeed: string
  DisplayData: DisplayData
  OriginSrcID: string
  RecoverCacheTime: string
  ResultURL: string
  Sort: string
  SrcID: string
  SubResNum: string
  SubResult: any[]
  Weight: string
}
