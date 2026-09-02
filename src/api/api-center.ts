// TypeScript interfaces for the `public.api_center` PostgreSQL table
// SQL table definition:
// create table public.api_center (
//   id uuid not null default gen_random_uuid(),
//   create_time timestamp with time zone not null default now(),
//   url character varying not null,
//   response character varying null,
//   api_platform character varying null,
//   key character varying null,
//   note character varying null,
//   constraint api_center_pkey primary key (id),
//   constraint api_center_key_key unique (key)
// ) TABLESPACE pg_default;

/**
 * Represents a row in the `public.api_center` table.
 * Field names mirror the database column names (snake_case).
 */
export interface ApiCenter {
  /** uuid, primary key */
  id: string

  /** timestamp with time zone; returned as string (ISO) or Date */
  create_time: string | Date
  update_time: string | Date

  /** url (not null) */
  url: string

  /** response (nullable) */
  response?: string

  /** api_platform (nullable) */
  api_platform?: string

  /** note (nullable) */
  note?: string
}

/**
 * Input shape for inserting a new ApiCenter row.
 * `id` and `create_time` are optional because DB provides defaults.
 */
export type ApiCenterInsert = Omit<ApiCenter, 'id' | 'create_time'> & Partial<Pick<ApiCenter, 'id' | 'create_time'>>

export interface InfoWaySymbol {
  symbol: string
  name_cn: string
  name_hk: string
  name_en: string
}

/**
 * 通用 Infoway API 响应包裹类型
 */
export interface InfoWayApiResponse<T> {
  ret: number
  msg: string
  traceId?: string
  data: T
}

export interface InfoWayCandlestickItem {
  // 时间戳（秒或字符串），例如 "1769496000"
  t: string
  h: string // high
  o: string // open
  l: string // low
  c: string // close
  v: string // volume
  vw?: string // 可能的加权量/加权价格字段
  pc?: string // percent change 字符串，可能带 %
  pca?: string // 可能的额外字段（如价格差）
}
