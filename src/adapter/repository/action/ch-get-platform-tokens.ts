import { AdapterParams } from '@/adapter/types'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'
import { Platform } from '@prisma/client'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChGetPlatformTokens = (p: { dateFrom: string; dateTo: string }) => Promise<
  Array<{
    sum: number
    platform: Platform
    requests: bigint
  }>
>

export const buildChGetPlatformTokens = ({ clickhouse }: Params): ChGetPlatformTokens => {
  return async ({ dateFrom, dateTo }) => {
    const query = `
      SELECT sum(amount) AS sum, 
        platform, 
        count(*) AS requests
      FROM transactions
      WHERE
        type = 'WRITE_OFF'
        AND created_at BETWEEN {dateFrom:DateTime}
        AND {dateTo:DateTime}
        AND model_id IS NOT NULL
        AND platform IS NOT NULL
      GROUP BY platform
      ORDER BY platform
    `

    const data = await clickhouse.client
      .query({
        query,
        format: 'JSON',
        query_params: {
          dateFrom: toCHDateTime(dateFrom),
          dateTo: toCHDateTime(dateTo),
        },
      })
      .then((res) => res.json())
      .then(
        (json) =>
          json.data as Array<{
            sum: number
            platform: string | null
            requests: string
          }>,
      )

    return data.map(({ sum, platform, requests }) => ({
      sum,
      platform: (platform as Platform) ?? 'unknown',
      requests: BigInt(requests),
    }))
  }
}
