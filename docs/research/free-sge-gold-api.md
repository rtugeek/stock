# 上海黄金交易所 Au99.99 免费数据接口调研

调研日期：2026-09-02（Asia/Shanghai）

## 结论

目前没有找到一个同时满足以下条件的官方开放 API：免费、无需鉴权、允许第三方桌面组件展示、提供 Au99.99 最新价和分时、并有稳定性承诺。

本项目最现实的免费方案是：

1. 若组件是普通浏览器/WebView 请求，首选东方财富公开行情端点 `118.AU9999`：一次 JSON 即可得到最新、开高低、昨收、涨跌和时间戳，实测支持 localhost 跨域；
2. 用上海黄金交易所（SGE）的公开“延时行情”页面/内部 JSON 作校验或备源；
3. 若 WidgetJS 支持绕开浏览器 CORS 的 Native HTTP，也可直接把 SGE 或新浪作为备源；否则放到自己的轻量后端/边缘函数代理、缓存。

如果产品要公开发布或面向多人展示，需先向上海黄金交易信息咨询有限公司确认授权。SGE 明确声明，未经许可不得传播、经营和使用其交易信息。此时“免费抓官网”不是合规的数据授权替代品。

## 仓库现状与失效原因

当前 [`src/api/gold-api.ts`](../../src/api/gold-api.ts) 使用三个未文档化的官网接口：

- `POST https://www.sge.com.cn/graph/quotations`：分时数组；
- `GET https://www.sge.com.cn/hqsj`：从 HTML 解析开、收盘价；
- `GET https://www.sge.com.cn/sjzx/quotation_daily_new?...`：从每日行情 HTML 解析昨收。

2026-09-02 实测发现：

- `POST /graph/quotations` 仍返回 HTTP 200 JSON，无 API key、token 或预先登录；返回 `times`、`data`、`min`、`max`、`heyue`、`delaystr`。
- 但是响应没有 `Access-Control-Allow-Origin`，因此普通浏览器/WebView 跨域请求会被拦截。这很可能就是组件侧“接口失效”的直接原因。
- 响应数据本身也有异常：`delaystr` 比 HTTP `Date` 所对应的上海时间多一天，而且大量未到时间的点被一个固定价格填充。它不适合作为可靠接口长期依赖。
- 官网“行情走势”页面当前源码调用的是 `POST /graph/Dailyhq`；该端点返回从 2016 年至今的日 OHLC 历史数据，而不是当日分时，因此不能直接替换 `/graph/quotations`。
- 官网公开页面和 JSON 端点都没有版本、SLA、频率限制或向后兼容承诺。未发现明确的速率限制说明，不等于无限调用。

官方页面：[行情走势](https://www.sge.com.cn/sjzx/mrhq)、[每日行情](https://www.sge.com.cn/sjzx/quotation_daily_new)。

## 候选方案比较

| 方案 | 鉴权/费用 | 可得字段 | CORS | 延迟与稳定性 | 结论 |
| --- | --- | --- | --- | --- | --- |
| SGE 延时行情页 `GET /sjzx/yshqbg` | 实测无需鉴权；公开访问，无单独 API 费用说明 | Au99.99 最新、最高、最低、今开 | 实测无 `Access-Control-Allow-Origin` | 官方标注“延时行情”；无 API/SLA 保证 | **推荐作为免费主数据源，经自有代理解析** |
| SGE 每日行情页 `GET /sjzx/quotation_daily_new` | 实测/公开页面无需鉴权；无单独 API 费用说明 | 日期、开高低收、涨跌、加权均价、量额等 | 官网响应未提供面向第三方的 CORS/API 承诺 | 日频；页面注明一个交易日的数据覆盖上一工作日晚盘及本工作日日盘；查询周期最多 1 个月 | **推荐补昨收** |
| SGE `POST /graph/quotations` | 实测无需鉴权、无需付费订阅 | 1 分钟 `times/data`、min/max、合约、延迟时间 | 实测无 CORS | 未公开文档；2026-09-02 实测有时间戳和填充值异常 | 仅可作为尽力而为的分时补充，不应做唯一源 |
| SGE `POST /graph/Dailyhq` | 实测无需鉴权、无需付费订阅 | 历史日 OHLC | 实测无 CORS | 官网自身当前使用，但仍是内部端点，无 SLA | 可做日 K，不是分时替代 |
| 东方财富 `GET push2.eastmoney.com/api/qt/stock/get?secid=118.AU9999...` | 实测无需注册、key 或登录，直接返回数据；无收费订阅步骤 | 最新、开高低、昨收、涨跌额/幅、行情时间 | 带 localhost Origin 实测返回匹配的 ACAO；仍应对实际 Widget 来源复测 | 302 到 `push2delay` 后返回 JSON；无公开 SLA/限频承诺 | **浏览器/WebView 最容易落地的主源** |
| 新浪 `GET hq.sinajs.cn/list=gds_AU9999` | 实测无需 key/登录，但必须带新浪财经 Referer | 最新、开高低、昨收、时间等 | OPTIONS 403，GET 无 ACAO | GB18030 的非正式 JS 文本；无 SLA/限频承诺 | 仅适合 Native HTTP/代理备源 |

SGE 的延时行情页在本次调研时直接展示 Au99.99 的“最新价、最高价、最低价、今开盘”，且页面标明来源和日期：[SGE 延时行情](https://www.sge.com.cn/sjzx/yshqbg)。每日行情页面列出“开盘价、最高价、最低价、收盘价”等字段，并注明交易日数据口径及最多一个月查询周期：[SGE 每日行情](https://www.sge.com.cn/sjzx/quotation_daily_new)。

## 推荐的数据组合

### 方案 A：当前组件能直接跨域请求（首选）

```text
GET https://push2.eastmoney.com/api/qt/stock/get
    ?secid=118.AU9999
    &fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f86,f169,f170
```

2026-09-02 实测无需 token/key，先 302 跳转到 `push2delay.eastmoney.com`，随后 HTTP 200 JSON。字段映射为：`f43` 最新、`f44` 最高、`f45` 最低、`f46` 今开、`f60` 昨收、`f86` Unix 时间戳、`f169` 涨跌额、`f170` 涨跌幅；本次样本的价格和涨跌额除以 100、涨跌幅除以 100。直接响应可复核：[东方财富 AU9999 行情 JSON](https://push2.eastmoney.com/api/qt/stock/get?secid=118.AU9999&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f86,f169,f170)。

实测带 `Origin: http://localhost:3000` 时响应回显该 Origin 并允许 credentials。部署时必须用组件真实 Origin 再测一次；`file://`、`null` Origin 或其他 localhost 端口不能据此自动视为已支持。它是财经站网页使用的公开端点，而非有服务协议的正式开放 API，所以应配置超时、缓存和备源。

### 方案 B：SGE 官方延时数据经代理/Native HTTP

服务端每 30～60 秒请求一次延时行情页并缓存：

```text
GET https://www.sge.com.cn/sjzx/yshqbg
```

从 Au99.99 行提取：

```json
{
  "symbol": "Au99.99",
  "last": 950.8,
  "high": 950.8,
  "low": 937.5,
  "open": 939.99,
  "source": "SGE delayed quote"
}
```

上述数字是 2026-09-02 调研时页面的样例，不应写死。交易日切换时，再查询最近若干自然日的每日行情并取最新一条已完成交易日记录作为 `previousClose`：

```text
GET https://www.sge.com.cn/sjzx/quotation_daily_new
    ?start_date=YYYY-MM-DD
    &end_date=YYYY-MM-DD
    &inst_ids=Au99.99
```

不要简单取“昨天”：周末、节假日会没有记录。建议向前查 7～10 个自然日，按日期倒序取第一条有效 `Au99.99` 收盘价。

分时图有三个选择：

- 最稳妥：暂时不提供分时，或在自己的服务端按每次抓到的延时最新价形成当日缓存序列；
- 尽力而为：服务端代理 `/graph/quotations`，严格校验日期、价格范围、非交易时段填充值，并在失败时退回自建序列；
- 正式产品：采购/申请获授权的展示类实时行情服务。

可选新浪备源：

```text
GET https://hq.sinajs.cn/list=gds_AU9999
Referer: https://finance.sina.com.cn/
```

2026-09-02 实测返回与 SGE 官方页面一致的最新、最高、最低、今开和昨收，但内容是 GB18030 编码的非正式 JS 文本，且没有 CORS；只能通过 Native HTTP 或代理访问。接口响应可复核：[新浪 AU9999 行情](https://hq.sinajs.cn/list=gds_AU9999)。

建议代理端设置请求超时、指数退避、最后成功值、来源时间和 `stale` 标志，避免交易所页面波动导致组件空白。轮询频率没有官方公开额度，30～60 秒只是保守工程建议，不是 SGE 授权的额度。

## 使用与授权边界

SGE 的“行情产品服务”页面写明：交易信息产品包含展示类实时行情、非展示类实时行情、历史数据和延时行情；信息经营和传播由指定信息公司代理；未经 SGE 或信息公司许可，不得传播、经营和使用交易信息。该页同时给出获授权的展示类服务商名单和咨询联系方式：[SGE 行情产品服务](https://www.sge.com.cn/sjzx/rzxxs)。

因此：

- “网页无需登录即可访问”只能证明技术上无需鉴权，不能推导出数据可免费再分发；
- 自用桌面组件与公开发布的应用风险不同，公开发布前应书面确认许可；
- 若要求实时、稳定、可商用，就不应以官网内部端点或第三方网页接口作为免费方案。

## 本次实测记录

测试时间约为 2026-09-02 22:26（Asia/Shanghai）：

- `GET /sjzx/yshqbg`：HTTP 200，`Content-Type: text/html;charset=UTF-8`；带 `Origin: http://localhost:5173` 请求时无 `Access-Control-Allow-Origin`。
- `POST /graph/quotations`，表单 `instid=Au99.99`：HTTP 200，`Content-Type: application/json;charset=UTF-8`；无需预置 Cookie/API key；无 `Access-Control-Allow-Origin`。
- `POST /graph/Dailyhq`，表单 `instid=Au99.99`：HTTP 200 JSON；返回日 OHLC 序列；无 `Access-Control-Allow-Origin`。
- 东方财富 `118.AU9999`：302 后 HTTP 200 JSON；无需预置 Cookie/API key；带 localhost Origin 时返回匹配的 CORS 许可头；错误市场号 `122` 不可靠，必须使用 `118`。
- 新浪 `gds_AU9999`：带新浪财经 Referer 时 HTTP 200；OPTIONS 403，GET 无 `Access-Control-Allow-Origin`；内容需按 GB18030 解码。
- 三个 SGE 端点返回 `Cache-Control: no-cache`；所有候选均未找到公开 SLA、速率限制说明或 API 版本承诺。

HTTP 实测是一次时间点检查，只证明当时可访问，不构成未来稳定性保证。页面字段依据均可在上述 SGE 官方链接复核。
