import { AdapterParams } from '@/adapter/types'
import { normalizeDate } from '@/lib'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'

type Params = Pick<AdapterParams, 'clickhouse' | 'db'>

export type ChGetEnterpriseStats = (params: {
  enterpriseId: string
  from: Date
  to: Date
  searchUsers?: string[]
}) => Promise<{
  employees: {
    id: string
    email: string | null
    tg_id: string | null
    usedTokens: bigint
    requestsCount: number
  }[]
  currentBalance: bigint
  totalEnterpriseTokensUsed: bigint
  totalEnterpriseTokensCredited: bigint
}>

export const buildChGetEnterpriseStats = ({ clickhouse, db }: Params): ChGetEnterpriseStats => {
  return async ({ enterpriseId, from, to, searchUsers }) => {
    const dateFrom = toCHDateTime(normalizeDate(from).toISOString())
    const dateTo = toCHDateTime(normalizeDate(to).toISOString())

    const userSearchCondition =
      Array.isArray(searchUsers) && searchUsers.length > 0
        ? `AND user_id IN (${searchUsers.map((_, i) => `{userId${i}:String}`).join(', ')})`
        : ''

    const employeesQuery = `
      SELECT user_id     AS id,
             sum(amount) AS usedTokens,
             count(*)    AS requestsCount
      FROM transactions
      WHERE enterprise_id = {enterpriseId:String}
        AND created_at BETWEEN {dateFrom:DateTime}
        AND {dateTo:DateTime}
        AND type = 'WRITE_OFF' ${userSearchCondition}
      GROUP BY user_id
      ORDER BY usedTokens DESC
    `

    const query_params: Record<string, string | Date> = {
      enterpriseId,
      dateFrom,
      dateTo,
      ...Object.fromEntries((searchUsers ?? []).map((id, i) => [`userId${i}`, id])),
    }

    const employees = await clickhouse.client
      .query({
        query: employeesQuery,
        format: 'JSON',
        query_params,
      })
      .then((res) => res.json())
      .then((res) =>
        (
          res.data as {
            id: string | null
            usedTokens: number
            requestsCount: number
          }[]
        )
          .filter((e) => e.id)
          .map(({ id, usedTokens, requestsCount }) => ({
            id: id!,
            email: null,
            tg_id: null,
            usedTokens: BigInt(Math.round(usedTokens)),
            requestsCount,
          })),
      )

    const creditedQuery = `
      SELECT COALESCE(sum(amount), 0) AS totalCredited
      FROM bothubch.transactions
      WHERE enterprise_id = {enterpriseId:String}
        AND created_at BETWEEN {dateFrom:DateTime}
        AND {dateTo:DateTime}
        AND type = 'REPLENISH'
        AND user_id = ''
    `
    const totalEnterpriseTokensCredited = await clickhouse.client
      .query({
        query: creditedQuery,
        format: 'JSON',
        query_params: {
          enterpriseId,
          dateFrom,
          dateTo,
        },
      })
      .then((res) => res.json() as Promise<{ data: { totalCredited: number }[] }>)
      .then((res) => BigInt(Math.round(res.data?.[0]?.totalCredited ?? 0)))

    const currentBalanceResult: Array<{ currentBalance: bigint }> = await db.client.$queryRaw`
      SELECT (
        (
          SELECT 
            s.balance
          FROM subscriptions s
          WHERE s.enterprise_id = ${enterpriseId}
          LIMIT 1
        )
        + (
          SELECT
            COALESCE(SUM(s.balance), 0)::bigint
          FROM employees e
          JOIN users u ON u.id = e.user_id
          JOIN subscriptions s ON s.user_id = u.id
          WHERE e.enterprise_id = ${enterpriseId}
        )
      ) AS "currentBalance"
    `
    const currentBalance = currentBalanceResult[0]?.currentBalance ?? 0n

    const totalEnterpriseTokensUsed = employees.reduce(
      (sum, { usedTokens }) => sum + usedTokens,
      0n,
    )

    return {
      employees,
      currentBalance,
      totalEnterpriseTokensUsed,
      totalEnterpriseTokensCredited,
    }
  }
}
