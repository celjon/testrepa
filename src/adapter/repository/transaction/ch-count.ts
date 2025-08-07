import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChCount = (params: {
  where: {
    user_id?: string
    developer_key_id_not_null?: boolean
  }
}) => Promise<number>

export const buildChCount = ({ clickhouse }: Params): ChCount => {
  return async ({ where }): Promise<number> => {
    const conds: string[] = []
    const query_params: Record<string, any> = {}

    if (where.user_id) {
      conds.push(`user_id = {user_id:String}`)
      query_params.user_id = where.user_id
    }
    if (where.developer_key_id_not_null) {
      conds.push(`developer_key_id IS NOT NULL`)
    }

    const whereSQL = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

    const sql = `
      SELECT count() AS cnt
      FROM transactions ${whereSQL}
    `

    const res = await clickhouse.client.query({
      query: sql,
      format: 'JSON',
      query_params,
    })

    const json = (await res.json()) as {
      data: Array<{ cnt: number }>
    }

    return json.data[0]?.cnt ?? 0
  }
}
