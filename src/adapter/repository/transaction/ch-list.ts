import { AdapterParams } from '@/adapter/types'
import { CHTransaction } from '@/adapter/repository/transaction/clickhouse-types'
import { ClickHouseToPrisma } from './clickhouse-to-prisma'
import { Transaction } from '@prisma/client'

type Params = Pick<AdapterParams, 'clickhouse'> & {
  clickhouseToPrisma: ClickHouseToPrisma
}
export type ChList = (params: {
  where?: {
    user_id?: string
    developer_key_id_not_null?: boolean
  }
  orderByCreatedAt?: 'asc' | 'desc'
  skip?: number
  take?: number
}) => Promise<Transaction[]>

export const buildChList = ({ clickhouse, clickhouseToPrisma }: Params): ChList => {
  return async ({ where = {}, orderByCreatedAt, skip = 0, take = 20 }) => {
    const conds: string[] = []

    if (where.user_id) {
      conds.push(`user_id = {user_id:String}`)
    }

    if (where.developer_key_id_not_null) {
      conds.push(`developer_key_id IS NOT NULL`)
    }

    const whereSQL = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const orderSQL = orderByCreatedAt ? `ORDER BY created_at ${orderByCreatedAt.toUpperCase()}` : ''

    const sql = `
      SELECT *
      FROM transactions ${whereSQL} ${orderSQL}
      LIMIT {take:UInt64}
      OFFSET {skip:UInt64}
    `
    const query_params: Record<string, any> = { take, skip }
    if (where.user_id) query_params.user_id = where.user_id

    const result = await clickhouse.client.query({
      query: sql,
      format: 'JSONEachRow',
      query_params,
    })

    const rows = (await result.json()) as CHTransaction[]
    return clickhouseToPrisma(rows)
  }
}
