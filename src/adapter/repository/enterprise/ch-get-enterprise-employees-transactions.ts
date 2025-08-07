import { AdapterParams } from '@/adapter/types'
import { logMemoryUsage } from '@/lib/logger'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'
import { normalizeDate } from '@/lib'
import { TransactionStatus, TransactionType } from '@prisma/client'
import {
  actionsModelIdAddedDate,
  actionsRemovedDate,
} from '@/adapter/repository/transaction/constants'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChGetEnterpriseEmployeesTransactions = (params: {
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
      email: string
      tg_id: string
    }
  }[]
>

export const buildChGetEnterpriseEmployeesTransactions = ({
  clickhouse,
}: Params): ChGetEnterpriseEmployeesTransactions => {
  return async ({ enterpriseId, from, to, search }) => {
    const now = performance.now()
    logMemoryUsage(
      `Start getAggregatedTransactions, for enterpriseId: ${enterpriseId}, from: ${from}, to: ${to}`,
    )

    const normalizedDateFrom = toCHDateTime(normalizeDate(from).toISOString())
    const normalizedDateTo = toCHDateTime(normalizeDate(to).toISOString())
    const userSearchCondition = search ? `AND user_id = '${search}'` : ''

    const query = `
      SELECT t.type,
             toStartOfDay(t.created_at) AS created_at,
             MAX(t.id)                  AS id,
             t.user_id,
             COALESCE(SUM(t.amount), 0) AS amount
      FROM transactions t
      WHERE (t.enterprise_id = {enterpriseId:String})
        AND t.created_at BETWEEN toDateTime({normalizedDateFrom:DateTime}) AND toDateTime({normalizedDateTo:DateTime})
        AND t.type IN ('WRITE_OFF', 'REPLENISH', 'REFERRAL_REWARD')
        AND (
        (t.created_at NOT BETWEEN toDateTime({actionsModelIdAddedDate:DateTime}) AND toDateTime({actionsRemovedDate:DateTime})) OR
        t.model_id IS NOT NULL)
        ${userSearchCondition}
      GROUP BY t.type, created_at, t.user_id
      ORDER BY created_at DESC, t.type
    `

    const transactions = await clickhouse.client
      .query({
        query,
        format: 'JSON',
        query_params: {
          enterpriseId,
          normalizedDateFrom,
          normalizedDateTo,
          actionsModelIdAddedDate: toCHDateTime(actionsModelIdAddedDate),
          actionsRemovedDate: toCHDateTime(actionsRemovedDate),
        },
      })
      .then((res) => res.json())
      .then((res) =>
        res.data.map((trx: any) => ({
          amount: trx.amount,
          created_at: new Date(trx.created_at),
          id: trx.id,
          type: trx.type as TransactionType,
          status: TransactionStatus.SUCCEDED,
          user: {
            id: trx.user_id,
            email: trx.email ?? '',
            tg_id: trx.tg_id ?? '',
          },
        })),
      )

    logMemoryUsage(
      `End getAggregatedTransactions ${performance.now() - now}ms for enterpriseId: ${enterpriseId}, from: ${from}, to: ${to}`,
    )

    return transactions
  }
}
