import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { logMemoryUsage } from '@/lib/logger'
import {
  actionsModelIdAddedDate,
  actionsRemovedDate,
} from '@/adapter/repository/transaction/constants'
import { normalizeDate } from '@/lib'

type Params = Pick<AdapterParams, 'db'>

export type GetEnterpriseStats = (params: {
  enterpriseId: string
  from: Date
  to: Date
  search?: string
}) => Promise<{
  employees: {
    email: string | null
    id: string
    tg_id: string | null
    usedTokens: bigint
    requestsCount: number
  }[]
  currentBalance: bigint
  totalEnterpriseTokensUsed: bigint
  totalEnterpriseTokensCredited: bigint
}>

export const buildGetEnterpriseStats = ({ db }: Params): GetEnterpriseStats => {
  return async ({ enterpriseId, from, to, search }) => {
    const now = performance.now()
    logMemoryUsage(
      `Start getAggregatedEnterpriseStats, for enterpriseId: ${enterpriseId}, from: ${from}, to: ${to}`,
    )

    const normalizedDateFrom = normalizeDate(from).toISOString()
    const normalizedDateTo = normalizeDate(to).toISOString()

    const searchCondition = search
      ? Prisma.sql` AND (u.email ILIKE ${`%${search}%`} OR u.tg_id ILIKE ${`%${search}%`})`
      : Prisma.empty

    const employees: Array<{
      email: string | null
      id: string
      tg_id: string | null
      usedTokens: bigint
      requestsCount: number
    }> = await db.client.$queryRaw`
      SELECT
        u.email,
        u.id,
        u.tg_id,
        SUM(t.amount)::bigint AS "usedTokens",
        COUNT(*) AS "requestsCount"
      FROM transactions t
      LEFT JOIN "Action" a ON t.id = a.transaction_id
      LEFT JOIN "users" u ON u.id = t.user_id
      WHERE
        (
          t.enterprise_id = ${enterpriseId}
          OR EXISTS (
            SELECT
              1
            FROM "employees" e
            WHERE e.user_id = t.user_id
              AND e.enterprise_id = ${enterpriseId}
          )
        )
        AND t.created_at BETWEEN ${normalizedDateFrom}::TIMESTAMP
        AND ${normalizedDateTo}::TIMESTAMP
        AND t.deleted = false
        AND t.provider = 'BOTHUB'
        AND t.currency = 'BOTHUB_TOKEN'
        AND t.type = 'WRITE_OFF'
        AND (
          t.created_at NOT BETWEEN ${actionsModelIdAddedDate}::TIMESTAMP
          AND ${actionsRemovedDate}::TIMESTAMP
          OR a.model_id IS NOT NULL
        )
        AND (
          t.from_user_id IS NULL
          OR t.from_user_id NOT IN (
            SELECT
              u2.id
            FROM users u2
            WHERE u2.role = 'ADMIN'
          )
        ) ${searchCondition}
      GROUP BY u.email, u.id, u.tg_id
      ORDER BY "usedTokens" DESC
    `

    // section credited
    const creditedResult: Array<{ totalCredited: bigint }> = await db.client.$queryRaw`
      SELECT COALESCE(SUM(t.amount), 0) ::bigint AS "totalCredited"
      FROM transactions t
             INNER JOIN "users" fu ON fu.id = t.from_user_id
      WHERE t.enterprise_id = ${enterpriseId}
        AND t.created_at BETWEEN ${normalizedDateFrom}::TIMESTAMP
        AND ${normalizedDateTo}::TIMESTAMP
        AND t.deleted = false
        AND t.provider = 'BOTHUB'
        AND t.currency = 'BOTHUB_TOKEN'
        AND t.type = 'REPLINSH'
        AND t.user_id IS NULL
        AND fu.role = 'ADMIN'
    `
    const totalEnterpriseTokensCredited = creditedResult[0]?.totalCredited ?? 0n

    // section currentBalance
    const currentBalanceResult: Array<{ currentBalance: bigint }> = await db.client.$queryRaw`
      SELECT
        (
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
      (total, employee) => total + employee.usedTokens,
      0n,
    )

    logMemoryUsage(
      `End getAggregatedEnterpriseStats ${performance.now() - now}ms for enterpriseId: ${enterpriseId}, from: ${from}, to: ${to}`,
    )

    return {
      employees,
      currentBalance,
      totalEnterpriseTokensUsed,
      totalEnterpriseTokensCredited,
    }
  }
}
