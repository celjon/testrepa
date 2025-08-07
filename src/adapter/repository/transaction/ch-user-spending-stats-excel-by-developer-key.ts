import { AdapterParams } from '@/adapter/types'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChUserSpendingStatsExcelByDeveloperKey = (params: {
  userId: string
  from: Date
  to: Date
}) => Promise<
  {
    date: Date
    spends: {
      developerKeyId: string
      amount: number
    }[]
  }[]
>

export const buildChUserSpendingStatsExcelByDeveloperKey = ({
  clickhouse,
}: Params): ChUserSpendingStatsExcelByDeveloperKey => {
  return async ({ userId, from, to }) => {
    const normalizedDateFrom = toCHDateTime(from.toISOString())
    const normalizedDateTo = toCHDateTime(to.toISOString())

    const query = `
        SELECT toDate(created_at) AS day, 
        toString(developer_key_id) AS developerKeyId, 
        COALESCE(SUM(amount), 0) AS amount
        FROM transactions
        WHERE
            user_id = {userId:String}
          AND created_at >= {dateFrom:DateTime}
          AND created_at
            < {dateTo:DateTime}
          AND developer_key_id IS NOT NULL
          AND type = 'WRITE_OFF'
        GROUP BY day, developer_key_id
        ORDER BY day ASC, developer_key_id
    `

    const transactionsResult = await clickhouse.client
      .query({
        query,
        format: 'JSON',
        query_params: {
          userId,
          dateFrom: normalizedDateFrom,
          dateTo: normalizedDateTo,
        },
      })
      .then((res) => res.json())
      .then(
        (json) =>
          json.data as {
            day: string
            developerKeyId: string
            amount: number
          }[],
      )

    const grouped: Record<string, { developerKeyId: string; amount: number }[]> = {}

    for (const row of transactionsResult) {
      const day = new Date(row.day)
      const yyyy = day.getUTCFullYear().toString().padStart(4, '0')
      const mm = (day.getUTCMonth() + 1).toString().padStart(2, '0')
      const dd = day.getUTCDate().toString().padStart(2, '0')
      const dayKey = `${yyyy}-${mm}-${dd}`

      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push({
        developerKeyId: row.developerKeyId,
        amount: row.amount,
      })
    }

    const resultArray: { date: Date; spends: { developerKeyId: string; amount: number }[] }[] =
      Object.entries(grouped)
        .sort(([dateA], [dateB]) => {
          if (dateA < dateB) return -1
          if (dateA > dateB) return 1
          return 0
        })
        .map(([dateStr, spends]) => {
          const [year, month, day] = dateStr.split('-').map(Number)
          const dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
          return { date: dateObj, spends }
        })
    return resultArray
  }
}
