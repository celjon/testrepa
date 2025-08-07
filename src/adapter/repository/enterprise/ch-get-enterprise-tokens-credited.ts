import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChGetEnterpriseTokensCredited = (
  month: string,
  year: string,
) => Promise<
  {
    enterprise_id: string
    creditedTokens: bigint
    month: string
    year: string
  }[]
>

export const buildChGetEnterpriseTokensCredited = ({
  clickhouse,
}: Params): ChGetEnterpriseTokensCredited => {
  return async (month: string, year: string) => {
    const normalizedMonth = Number(month)
    const normalizedYear = Number(year)

    const query = `
      SELECT t.enterprise_id,
             SUM(t.amount) AS creditedTokens,
             EXTRACT(MONTH FROM t.created_at) AS month,
        EXTRACT(YEAR FROM t.created_at) AS year
      FROM transactions t
      WHERE
        t.type = 'REPLENISH'
        AND t.source = 'auto_credit_replenish'
        AND EXTRACT (MONTH FROM t.created_at) = ${normalizedMonth}
        AND EXTRACT (YEAR FROM t.created_at) = ${normalizedYear}
      GROUP BY
        t.enterprise_id,
        month,
        year
      ORDER BY
        t.enterprise_id,
        year,
        month
    `

    return await clickhouse.client
      .query({
        query,
        format: 'JSON',
        query_params: {},
      })
      .then((res) => res.json())
      .then((res) =>
        (res.data as any[]).map(({ enterprise_id, creditedTokens, month, year }) => ({
          enterprise_id,
          creditedTokens: BigInt(Math.trunc(creditedTokens)),
          month: String(month),
          year: String(year),
        })),
      )
  }
}
