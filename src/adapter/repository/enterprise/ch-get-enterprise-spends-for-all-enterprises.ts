import { AdapterParams } from '@/adapter/types'
import { logMemoryUsage } from '@/lib/logger'
import {
  actionsModelIdAddedDate,
  actionsRemovedDate,
} from '@/adapter/repository/transaction/constants'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChGetEnterpriseSpendsForAllEnterprises = (params: {
  month?: string
  year?: string
  adminIds?: string[]
}) => Promise<
  Array<{
    enterprise_id: string
    usedTokens: number
    month: string
    year: string
  }>
>

export const buildChGetEnterpriseSpendsForAllEnterprises = ({
  clickhouse,
}: Params): ChGetEnterpriseSpendsForAllEnterprises => {
  return async ({ month, year, adminIds }) => {
    const now = performance.now()
    logMemoryUsage('Start GetAggregateEnterprise (Clickhouse)')

    let fromIso: string | undefined
    let toIso: string | undefined

    if (month && year) {
      const y = Number(year)
      const m = Number(month) - 1
      fromIso = toCHDateTime(new Date(Date.UTC(y, m, 1, 0)))
      toIso = toCHDateTime(new Date(Date.UTC(y, m + 1, 1, 0)))
    }

    let dateFilter = ''
    if (fromIso && toIso) {
      dateFilter = `AND t.created_at >= toDateTime({fromIso:DateTime}) AND t.created_at < toDateTime({toIso:DateTime})`
    }

    const query = `
      SELECT t.enterprise_id,
             toString(toMonth(t.created_at)) AS month,
        toString(toYear(t.created_at)) AS year,
        COALESCE(sum(t.amount), 0) AS usedTokens
      FROM transactions t
      WHERE
        t.enterprise_id != ''
        AND t.type = 'WRITE_OFF'
        AND (
          (t.created_at NOT BETWEEN toDateTime({actionsModelIdAddedDate:DateTime})
        AND toDateTime({actionsRemovedDate:DateTime}))
         OR t.model_id IS NOT NULL
        )
        AND (t.from_user_id IS NULL
         OR t.from_user_id NOT IN ({adminIds:Array(String)})) ${dateFilter}
      GROUP BY t.enterprise_id, month, year
      ORDER BY t.enterprise_id, year, month
    `

    const result = await clickhouse.client
      .query({
        query,
        format: 'JSON',
        query_params: {
          fromIso: fromIso ?? '',
          toIso: toIso ?? '',
          actionsModelIdAddedDate: toCHDateTime(actionsModelIdAddedDate),
          actionsRemovedDate: toCHDateTime(actionsRemovedDate),
          adminIds,
        },
      })
      .then((res) => res.json())
      .then((res) =>
        res.data.map((row: any) => ({
          enterprise_id: row.enterprise_id,
          usedTokens: row.usedTokens,
          month: row.month,
          year: row.year,
        })),
      )

    logMemoryUsage(`End GetEnterpriseSpends (Clickhouse): ${performance.now() - now}ms`)
    return result
  }
}
