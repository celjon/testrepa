import { AdapterParams } from '@/adapter/types'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChGetTokensByModel = (params: { dateFrom: string; dateTo: string }) => Promise<
  {
    sum: number
    model_id: string
    requests: bigint
  }[]
>

export const buildChGetTokensByModel = ({ clickhouse }: Params): ChGetTokensByModel => {
  return async ({ dateFrom, dateTo }) => {
    const query = `
      SELECT sum(amount) AS sum,
    model_id,
    count(*) AS requests
      FROM transactions
      WHERE
        type = 'WRITE_OFF'
        AND created_at BETWEEN {dateFrom:DateTime}
        AND {dateTo:DateTime}
      GROUP BY model_id
      ORDER BY sum DESC
    `
    const data = (
      await clickhouse.client
        .query({
          query,
          format: 'JSON',
          query_params: {
            dateFrom: toCHDateTime(dateFrom),
            dateTo: toCHDateTime(dateTo),
          },
        })
        .then((res) => res.json())
    ).data as {
      sum: number
      model_id: string | null
      requests: string
    }[]

    return data.map(({ sum, model_id, requests }) => ({
      sum,
      model_id: model_id ?? 'unknown',
      requests: BigInt(requests),
    }))
  }
}
