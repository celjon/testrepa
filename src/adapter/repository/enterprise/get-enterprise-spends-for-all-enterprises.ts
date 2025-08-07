import { AdapterParams } from '@/adapter/types'
import { logMemoryUsage } from '@/lib/logger'
import {
  actionsModelIdAddedDate,
  actionsRemovedDate,
} from '@/adapter/repository/transaction/constants'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type GetEnterpriseSpendsForAllEnterprises = (
  month?: string,
  year?: string,
) => Promise<
  Array<{
    name: string
    creator: string
    agreement_conclusion_date: string
    usedTokens: bigint
    month: string
    year: string
  }>
>

export const buildGetEnterpriseSpendsForAllEnterprises = ({
  db,
}: Params): GetEnterpriseSpendsForAllEnterprises => {
  return async (month?: string, year?: string) => {
    const now = performance.now()
    logMemoryUsage(`Start GetEnterpriseSpends`)

    let fromIso: string | undefined
    let toIso: string | undefined

    if (month && year) {
      const y = Number(year)
      const m = Number(month) - 1
      fromIso = new Date(Date.UTC(y, m, 1, 0)).toISOString()
      toIso = new Date(Date.UTC(y, m + 1, 1, 0)).toISOString()
    }

    const result: Array<{
      name: string
      creator: string
      agreement_conclusion_date: string
      usedTokens: bigint
      month: string
      year: string
    }> = await db.client.$queryRaw`
      SELECT e.name,
             e.creator,
             e.agreement_conclusion_date,
             COALESCE(SUM(t.amount), 0)::bigint AS "usedTokens", TO_CHAR(t.created_at, 'MM') AS month,
        TO_CHAR(t.created_at, 'YYYY') AS year
      FROM enterprises e
        LEFT JOIN transactions t
      ON t.enterprise_id = e.id
        OR EXISTS (SELECT 1 FROM employees emp WHERE emp.user_id = t.user_id AND emp.enterprise_id = e.id)
        LEFT JOIN "Action" a ON t.id = a.transaction_id
      WHERE
        t.deleted = false
        AND t.provider = 'BOTHUB'
        AND t.currency = 'BOTHUB_TOKEN'
        AND t.type = 'WRITE_OFF'
        AND (
        t.created_at NOT BETWEEN ${actionsModelIdAddedDate}:: TIMESTAMP
        AND ${actionsRemovedDate}:: TIMESTAMP
         OR a.model_id IS NOT NULL
        )
        AND t.id NOT IN (
        SELECT t2.id FROM transactions t2 INNER JOIN users fu ON fu.id = t2.from_user_id WHERE fu.role = 'ADMIN'
        ) ${fromIso && toIso ? Prisma.sql`AND t.created_at >= ${fromIso}::TIMESTAMP AND t.created_at < ${toIso}::TIMESTAMP` : Prisma.empty}
      GROUP BY e.name, e.creator, e.agreement_conclusion_date, month, year
      ORDER BY e.name, year, month
    `

    logMemoryUsage(`End GetEnterpriseSpends ${performance.now() - now}ms`)

    return result
  }
}
