import { AdapterParams } from '@/adapter/types'
import { logMemoryUsage } from '@/lib/logger'

type Params = Pick<AdapterParams, 'db'>

export type GetAggregateEnterpriseTokensCredited = (
  month: string,
  year: string
) => Promise<
  Array<{
    name: string
    creator: string
    agreement_conclusion_date: string
    rubs_per_million_caps: number
    creditedTokens: bigint
    month: string
    year: string
  }>
>

export const buildGetAggregateEnterpriseTokensCredited = ({ db }: Params): GetAggregateEnterpriseTokensCredited => {
  return async (month: string, year: string) => {
    const now = performance.now()
    logMemoryUsage(`Start GetAggregateEnterpriseTokensCredited`)

    const enterprisesCreditedResult: Array<{
      name: string
      creator: string
      rubs_per_million_caps: number
      agreement_conclusion_date: string
      creditedTokens: number
      month: string
      year: string
    }> = await db.client.$queryRaw`
      SELECT e.name,
             e.creator,
             e.rubs_per_million_caps,
             e.agreement_conclusion_date,
             SUM(t.amount) AS "creditedTokens",
             EXTRACT(MONTH FROM t.created_at) AS month,
  EXTRACT(YEAR FROM t.created_at) AS year
      FROM enterprises e
        LEFT JOIN transactions t
      ON t.enterprise_id = e.id
        LEFT JOIN users admin ON admin.id = t.from_user_id AND admin.role = 'ADMIN'
      WHERE
        t.deleted = false
        AND t.provider = 'BOTHUB'
        AND t.currency = 'BOTHUB_TOKEN'
        AND t.type = 'REPLINSH'
        AND (t.meta ->> 'source') = 'auto_credit_replenish'
        AND EXTRACT (MONTH FROM t.created_at) = CAST(${month} AS int)
        AND EXTRACT (YEAR FROM t.created_at) = CAST(${year} AS int)
      GROUP BY
        e.name,
        e.creator,
        e.rubs_per_million_caps,
        e.agreement_conclusion_date,
        month,
        year
      ORDER BY
        e.name,
        year,
        month
    `

    logMemoryUsage(`End GetAggregateEnterpriseTokensCredited ${performance.now() - now}ms`)

    return enterprisesCreditedResult.map((enterpriseUsage) => ({
      ...enterpriseUsage,
      creditedTokens: BigInt(Math.trunc(enterpriseUsage.creditedTokens))
    }))
  }
}
