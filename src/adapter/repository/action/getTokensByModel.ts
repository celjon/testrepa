import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type GetTokensByModel = (params: { dateFrom: string; dateTo: string }) => Promise<
  Array<{
    sum: number
    model_id: string
    requests: bigint
  }>
>

export const buildGetTokensByModel = ({ db }: Params): GetTokensByModel => {
  return async ({ dateTo, dateFrom }) => {
    const normalizedDateTo = new Date(dateTo).toISOString()
    const normalizedDateFrom = new Date(dateFrom).toISOString()

    const data: Array<{
      sum: number
      model_id: string | null
      requests: bigint
    }> = await db.client.$queryRaw`
      select 
        sum(t.amount) as sum, 
        a.model_id as model_id,
        COUNT(*) as requests
      from "Action" as a 
      left join transactions as t on a.transaction_id = t.id 
      where 
        t.provider = 'BOTHUB' and 
        t.type ='WRITE_OFF' and 
        t.status = 'SUCCEDED' and 
        t.currency = 'BOTHUB_TOKEN' and 
        t.deleted = false and
        t.created_at between ${normalizedDateFrom}::TIMESTAMP and 
        ${normalizedDateTo}::TIMESTAMP
      group by a.model_id
      order by sum DESC
    `

    return data.map(({ sum, model_id, requests }) => ({
      sum,
      model_id: model_id ?? 'unknown',
      requests: requests
    }))
  }
}
