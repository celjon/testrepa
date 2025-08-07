import { Prisma, TransactionType } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { logMemoryUsage } from '@/lib/logger'
import { normalizeDate } from '@/lib'
import {
  actionsModelIdAddedDate,
  actionsRemovedDate,
} from '@/adapter/repository/transaction/constants'

type Params = Pick<AdapterParams, 'db'>

export type GetEnterpriseEmployeesTransactions = (params: {
  enterpriseId: string
  from: Date
  to: Date
  search?: string
}) => Promise<
  {
    amount: number
    created_at: Date
    id: string
    type: TransactionType
    status: 'SUCCEDED'
    user: {
      id: string
      email: string | null
      tg_id: string | null
    }
  }[]
>

export const buildGetEnterpriseEmployeesTransactions = ({
  db,
}: Params): GetEnterpriseEmployeesTransactions => {
  return async ({ enterpriseId, from, to, search }) => {
    const now = performance.now()
    logMemoryUsage(
      `Start getdTransactions, for enterpriseId: ${enterpriseId}, from: ${from}, to: ${to}`,
    )

    const normalizedDateFrom = normalizeDate(from).toISOString()
    const normalizedDateTo = normalizeDate(to).toISOString()

    const searchCondition = search
      ? Prisma.sql` AND (u.email ILIKE ${`%${search}%`} OR u.tg_id ILIKE ${`%${search}%`})`
      : Prisma.empty

    const transactionsResult: {
      amount: number
      created_at: Date
      id: string
      type: TransactionType
      status: 'SUCCEDED'
      user_id: string
      email: string
      tg_id: string
    }[] = await db.client.$queryRaw`
      SELECT t.type,
             EXTRACT(YEAR FROM t.created_at) AS year,
        EXTRACT(MONTH FROM t.created_at) AS month,
        EXTRACT(DAY FROM t.created_at) AS day,
        COALESCE(SUM(t.amount), 0) AS amount,
        MAX(t.created_at) AS created_at,  
        MAX(t.id) AS id,                  
        MAX(t.status) AS status, 
        t.user_id,
        u.email,
        u.tg_id
      FROM transactions t
        LEFT JOIN "users" u
      ON u.id = COALESCE (t.user_id, t.from_user_id)
        LEFT JOIN "Action" a ON t.id = a.transaction_id
      WHERE (
        t.enterprise_id = ${enterpriseId}
         OR EXISTS (SELECT 1 FROM "employees" e WHERE e.user_id = t.user_id
        AND e.enterprise_id = ${enterpriseId}))
        AND t.created_at BETWEEN ${normalizedDateFrom}:: TIMESTAMP
        AND ${normalizedDateTo}:: TIMESTAMP
        AND t.deleted = false
        AND t.provider = 'BOTHUB'
        AND t.currency = 'BOTHUB_TOKEN'
        AND t.type IN ('WRITE_OFF'
          , 'REPLINSH'
          , 'REFERRAL_REWARD')
        AND t.status = 'SUCCEDED'
        AND (
        t.created_at NOT BETWEEN ${actionsModelIdAddedDate}:: TIMESTAMP
        AND ${actionsRemovedDate}:: TIMESTAMP
         OR a.model_id IS NOT NULL)
        AND (
        t.from_user_id IS NULL
         OR
        t.from_user_id NOT IN (SELECT u2.id FROM users u2 WHERE u2.role = 'ADMIN')) ${searchCondition}
      GROUP BY t.type, year, month, day, t.user_id, u.email, u.tg_id
      ORDER BY year DESC, month DESC, day DESC, t.type
    `
    logMemoryUsage(
      `End getdTransactions ${performance.now() - now}ms for enterpriseId: ${enterpriseId}, from: ${from}, to: ${to}`,
    )

    const transactions = transactionsResult.map((trx) => ({
      amount: trx.amount,
      created_at: trx.created_at,
      id: trx.id,
      type: trx.type as TransactionType,
      status: trx.status,
      user: {
        id: trx.user_id,
        email: trx.email ?? null,
        tg_id: trx.tg_id ?? null,
      },
    }))

    return transactions
  }
}
