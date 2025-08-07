import { AdapterParams } from '@/adapter/types'
import { normalizeDate } from '@/lib'
import { logMemoryUsage } from '@/lib/logger'

type Params = Pick<AdapterParams, 'db'>

export type UserSpendingStatsExcelByDeveloperKey = (params: {
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

export const buildUserSpendingStatsExcelByDeveloperKey = ({
  db,
}: Params): UserSpendingStatsExcelByDeveloperKey => {
  return async ({ userId, from, to }) => {
    const startTs = performance.now()
    logMemoryUsage(
      `Start UserSpendingStatsExcelByDeveloperKey for userId=${userId}, from=${from.toISOString()}, to=${to.toISOString()}`,
    )

    const normalizedDateFrom = normalizeDate(from).toISOString()
    const toMidnightNext = normalizeDate(to).toISOString()

    const transactionsResult: {
      day: Date
      developerKeyId: string
      amount: number
    }[] = await db.client.$queryRaw`
      SELECT
        date_trunc('day', t.created_at) AS day,
        t.developer_key_id AS "developerKeyId",
        COALESCE(SUM(t.amount), 0) AS amount
      FROM transactions t
      WHERE
        t.user_id = ${userId}
        AND t.created_at >= ${normalizedDateFrom}::TIMESTAMP
        AND t.created_at < ${toMidnightNext}::TIMESTAMP
        AND t.developer_key_id IS NOT NULL
        AND t.deleted = false
        AND t.type = 'WRITE_OFF'
        AND t.status = 'SUCCEDED'
        AND t.provider = 'BOTHUB'
        AND t.currency = 'BOTHUB_TOKEN'
      GROUP BY day, t.developer_key_id
      ORDER BY day ASC, t.developer_key_id
    `

    const grouped: Record<string, { developerKeyId: string; amount: number }[]> = {}
    for (const row of transactionsResult) {
      const day = row.day
      const yyyy = day.getUTCFullYear().toString().padStart(4, '0')
      const mm = (day.getUTCMonth() + 1).toString().padStart(2, '0')
      const dd = day.getUTCDate().toString().padStart(2, '0')
      const dayKey = `${yyyy}-${mm}-${dd}`

      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push({
        developerKeyId: row.developerKeyId,
        amount: Number(row.amount),
      })
    }

    const result: { date: Date; spends: { developerKeyId: string; amount: number }[] }[] =
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
    logMemoryUsage(
      `End UserSpendingStatsExcelByDeveloperKey in ${(performance.now() - startTs).toFixed(2)}ms for userId=${userId}, from=${from.toISOString()}, to=${to.toISOString()}`,
    )
    return result
  }
}
