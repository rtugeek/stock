import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const baseUrl = (import.meta as any).env?.BASE_URL || '/'

interface WidgetPreview {
  title: string
  description: string
  path: string
  previewImage: string
  category: string
  size: string
}

const widgetList: WidgetPreview[] = [
  {
    title: '自选股票',
    description: '跟踪多只股票价格，支持拖拽排序',
    path: '/widget/stock',
    previewImage: `${baseUrl}preview_stock_large.png`,
    category: '股票',
    size: '4x4',
  },
  {
    title: '股票小型',
    description: '紧凑型单只股票卡片',
    path: '/widget/stock_small',
    previewImage: `${baseUrl}preview_stock_small.png`,
    category: '股票',
    size: '2x2',
  },
  {
    title: '大A指数',
    description: '上证指数、深证成指、创业板指',
    path: '/widget/stock_medium',
    previewImage: `${baseUrl}preview_stock_medium.png`,
    category: '股票',
    size: '4x2',
  },
  {
    title: '黄金价格',
    description: 'AU99.99 实时金价与分时图',
    path: '/widget/gold',
    previewImage: `${baseUrl}preview_gold.png`,
    category: '贵金属',
    size: '2x2',
  },
  {
    title: '虚拟币小型',
    description: '单币种实时价格与走势图',
    path: '/widget/coin_small',
    previewImage: `${baseUrl}preview_coin_small.png`,
    category: '加密货币',
    size: '2x2',
  },
  {
    title: '主流虚拟币',
    description: '多币种实时行情一览',
    path: '/widget/coin_medium',
    previewImage: `${baseUrl}preview_coin_medium.png`,
    category: '加密货币',
    size: '4x4',
  },
  {
    title: '国际贵金属',
    description: '黄金/白银/铜/铂金价格',
    path: '/widget/metal',
    previewImage: `${baseUrl}preview_metal.png`,
    category: '贵金属',
    size: '4x2',
  },
]

function getCategoryColor(category: string): string {
  switch (category) {
    case '股票':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case '贵金属':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    case '加密货币':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            行情组件中心
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            选择一个 Widget 查看实时行情
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {widgetList.map((widget) => (
            <Link
              key={widget.path}
              to={widget.path}
              className="group block"
            >
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 border-slate-200 dark:border-slate-800">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={widget.previewImage}
                    alt={widget.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm font-mono text-xs"
                    >
                      {widget.size}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {widget.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-3 line-clamp-2 text-slate-600 dark:text-slate-400">
                    {widget.description}
                  </CardDescription>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs border',
                      getCategoryColor(widget.category)
                    )}
                  >
                    {widget.category}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
