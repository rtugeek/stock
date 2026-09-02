# 公共金属行情 API 调研

调研日期：2026-09-02

目标：为 `metal` widget 提供黄金、白银、铜、铂金的当前价格和日涨跌幅。重点考察前端可直连、免费额度、行情口径和长期稳定性。

## 结论

当前项目最实用的免费方案是 **BiQuote**：无需注册或 API Key、允许浏览器跨域、一个批量请求覆盖四种金属，并直接返回 `dayDiffPercent`。建议替换现有 Gold API 时使用：

```text
GET https://biquote.io/api/latest?symbols=XAUUSD&symbols=XAGUSD&symbols=XCUUSD&symbols=XPTUSD
```

价格应取 `mid`（文档明确说明 FX/CFD 来源的 `last` 恒为 0），涨跌幅取 `dayDiffPercent`；同时读取 `marketState`、`stale` 和 `quoteAgeSeconds`，闭市或陈旧行情应在 UI 上标记，而不是伪装成实时价格。

需要注意，BiQuote 是聚合的 MT5 经纪商报价，品种属于 OTC/CFD 口径，不是 LBMA/LME 官方基准，也没有公开 SLA。适合桌面行情小组件，不适合交易结算、审计或严肃商业再分发。生产代码应保留缓存、超时和失败时沿用最后成功结果。

如果愿意注册 API Key 且可接受很低的免费额度，**Metals.Dev** 是字段语义和产品文档最完整的备选：其 spot endpoint 原生返回 `price`、`high`、`low`、`change`、`change_percent`，支持 gold、silver、copper、platinum，且官方明确支持 CORS。但免费版仅 100 请求/月，不可能支撑当前 30 秒刷新；即使一次请求只能查询一种金属，额度消耗更快。

## 实测：BiQuote

2026-09-02 从本机请求批量端点得到 HTTP 200，响应覆盖：

| Widget 品种 | Symbol | 报价口径 | 关键字段 |
|---|---|---|---|
| Gold | `XAUUSD` | Gold vs USD，MT5 broker feed | `mid`, `dayDiffPercent`, `high`, `low` |
| Silver | `XAGUSD` | Silver vs USD，MT5 broker feed | 同上 |
| Copper | `XCUUSD` | Copper vs USD，OTC/MT5 | 同上；单位/合约口径须在 UI 标明 |
| Platinum | `XPTUSD` | Platinum，COMEX 标注/MT5 feed | 同上 |

带 `Origin: http://localhost:5173` 请求时，服务响应：

```text
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
```

实测 JSON 中四个品种均有 `stale: false`、`marketState: "open"` 和接近零的 `quoteAgeSeconds`。官方文档称所有只读 REST endpoint 无认证、CORS 开放，并建议实时场景使用 WebSocket 而不是高频轮询；REST 文档没有公布具体数字限额。[BiQuote 官方文档](https://biquote.io/docs/)

一个需要留意的数据语义问题：实测中 `direction` 表示最近一跳方向，不一定与 `dayDiffPercent` 的正负一致。因此涨跌颜色必须以 `dayDiffPercent` 为准，不能使用 `direction`。

## 候选比较

| API | 四品种覆盖 | 日涨跌幅 | 免费/认证 | CORS | 行情性质 | 判断 |
|---|---|---|---|---|---|---|
| BiQuote | XAU/XAG/XCU/XPT | 直接返回 `dayDiffPercent` | 免费、无 Key、无注册 | 官方声明开放；localhost 实测通过 | MT5 经纪商 OTC/CFD 聚合，实时 tick | **当前首选** |
| Metals.Dev | gold/silver/copper/platinum | spot endpoint 直接返回 `change_percent` | Key；免费 100 次/月 | 官方明确支持 | 聚合 15+ 来源；贵金属/工业金属 spot，免费版最长延迟 60 秒 | 字段最好，但免费额度不适合轮询 |
| GoldAPI.io | XAU/XAG/XPT/XPD；**无铜** | `change_percent`、`prev_close_price` | Key；免费 100 次/月 | 不应把 Key 暴露到前端，宜后端代理 | FOREX/LBMA 贵金属现货，宣称实时 | 缺铜且额度太低 |
| Twelve Data | 贵金属 spot；铜等商品/期货目录 | 可用 `/quote` 或以 time series 计算 | Key；Basic 免费 8 credits/min、800/day，但 commodities market data 列在 Grow | 前端暴露 Key 不理想 | spot 与 futures 均有，REST 分钟级 | 免费计划不能作为四品种正式方案 |
| Yahoo Finance | `GC=F`, `SI=F`, `HG=F`, `PL=F` | 非公开 quote/chart JSON 常含 previous close/change | 无正式行情 API Key | 浏览器 CORS/crumb/限流不稳定 | COMEX/NYMEX 近月期货，不是现货 | 仅可作为无保证 fallback，不建议主源 |
| Stooq | 有商品历史数据，但符号/覆盖和延迟不够透明 | 可由日线收盘计算 | 2026 年起下载端点需 Key；具体额度未公开 | CSV 前端直连不可靠 | 主要适合日线/历史行情 | 不适合实时 widget |

## 各方案依据与限制

### Metals.Dev

官方 spot endpoint：

```text
GET https://api.metals.dev/v1/metal/spot?api_key=...&metal=gold&currency=USD
```

返回 `price`、`ask`、`bid`、`high`、`low`、`change`、`change_percent`，支持 gold、silver、platinum、palladium、aluminum、copper 等；最大延迟 60 秒。所有计划均有这些 endpoint，支持浏览器 CORS。[官方 API 文档](https://metals.dev/docs)

免费计划为 100 requests/month、无需信用卡，付费最低档为 2,000 requests/month。以四品种每 30 秒分别请求计算，约需 345,600 requests/month，远超免费额度；即使改为每 5 分钟，也约 34,560 次/月。[官方价格页](https://metals.dev/pricing)

### GoldAPI.io

响应原生包含 `prev_close_price`、`change`、`change_percent`，比当前使用的 `exchangeRate` 正确；后者只是货币换算汇率，不能代表金属日涨跌。免费 Sandbox 为 100 requests/month，覆盖 XAU、XAG、XPT、XPD，2 秒更新，但不覆盖铜；正式 unlimited 方案标价 99 USD/月。[GoldAPI.io 官方说明与价格](https://www.goldapi.io/)

### Twelve Data

官方提供 commodities reference data 与 `/time_series`，商品页称 REST 分钟级更新，并覆盖贵金属和工业金属。但 2026 年价格页显示 Basic 免费计划主要覆盖美股、外汇、加密和 reference data，**Commodities market data 从 Grow 计划开始**。所以免费额度数字看似充足（8 credits/min、800/day），却不等于四种商品行情均可免费使用。[官方商品页](https://twelvedata.com/commodities)、[官方价格页](https://twelvedata.com/pricing)、[官方 API 文档](https://twelvedata.com/docs/market-data)

### Yahoo Finance 与 Stooq

Yahoo Developer Network 当前公开 API 目录没有 Yahoo Finance 行情 API；常见 `query1/query2.finance.yahoo.com` 接口属于网站内部端点，不应视作有稳定性或兼容承诺的开放 API。[Yahoo 官方 API 目录](https://developer.yahoo.com/api/)

Yahoo 的 `GC=F`（黄金）、`SI=F`（白银）、`HG=F`（铜）、`PL=F`（铂金）都是期货合约。即使接口可用，其价格与 widget 现在展示的金属 spot/CFD 价格也不是同一口径，且可能因主力合约切换出现跳变。

Stooq 更适合日线历史下载。其下载接口在 2026 年开始要求通过站点获得 API Key，额度未公开；仅有 OHLC 时需用最近两个交易日 close 自行计算涨跌幅，无法提供真正的实时日内价格。因此不建议用于此 widget。

## 推荐接入约定

1. 使用 BiQuote 批量 endpoint，一次更新四品种，避免四个独立请求。
2. 当前价使用 `(bid + ask) / 2` 对应的 `mid`，日涨跌幅使用 `dayDiffPercent`。
3. 正负号和颜色只由 `dayDiffPercent` 判断；不要使用 `direction`。
4. `stale === true`、`marketState !== "open"` 或 `quoteAgeSeconds` 超阈值时展示“已收盘/旧报价”。
5. REST 建议 5–30 秒刷新并缓存；若未来追求 tick 级更新，按官方建议改用 SignalR WebSocket。
6. 在界面说明价格口径，例如“USD · broker CFD feed”；尤其铜的数值单位必须结合 symbol metadata 确认后展示，不要默认写成美元/盎司。
7. 保留现有最后成功结果缓存，并对 429、5xx、超时做退避。若 BiQuote 长期不可用，可切换 Metals.Dev 的付费档，而不是依赖 Yahoo 内部接口。

