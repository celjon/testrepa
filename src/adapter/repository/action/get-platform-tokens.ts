import { Platform } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type GetPlatformTokens = (p: { dateFrom: string; dateTo: string }) => Promise<
  Array<{
    sum: number
    platform: Platform
    requests: bigint
  }>
>

export const buildGetPlatformTokens = ({ db }: Params): GetPlatformTokens => {
  return async ({ dateTo, dateFrom }) => {
    const normalizedDateTo = new Date(dateTo).toISOString()
    const normalizedDateFrom = new Date(dateFrom).toISOString()

    const d: Array<{
      sum: number
      platform: Platform
      requests: bigint
    }> = await db.client.$queryRaw`
      select 
        sum(t.amount) as sum, 
        a.platform,
        COUNT(*) as requests
      from "Action" as a 
      left join transactions as t on a.transaction_id = t.id 
      where 
        t.provider = 'BOTHUB' and 
        t.type ='WRITE_OFF' and 
        t.status = 'SUCCEDED' and 
        t.currency = 'BOTHUB_TOKEN' and 
        t.deleted = false AND
        t.created_at between ${normalizedDateFrom}::TIMESTAMP and ${normalizedDateTo}::TIMESTAMP and
        a.model_id is not null and
        a.platform is not null
        group by a.platform
        order by a.platform
    `

    return d
  }
}
